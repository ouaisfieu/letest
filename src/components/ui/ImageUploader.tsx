import { useState, useRef } from 'react';
import { Upload, X, Check, Info, Image as ImageIcon, Loader } from 'lucide-react';
import { compressImage, formatFileSize, compressionTips, CompressionResult } from '../../utils/imageCompression';

interface ImageUploaderProps {
  currentUrl?: string;
  onUpload: (blob: Blob, result: CompressionResult) => void;
  type: 'avatar' | 'banner';
  maxSize?: number;
}

export function ImageUploader({ currentUrl, onUpload, type, maxSize = 2 * 1024 * 1024 }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dimensions = type === 'avatar'
    ? { maxWidth: 400, maxHeight: 400 }
    : { maxWidth: 1920, maxHeight: 400 };

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Veuillez selectionner une image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const compressed = await compressImage(file, {
        ...dimensions,
        quality: 0.85,
        format: 'webp',
      });

      if (compressed.compressedSize > maxSize) {
        const recompressed = await compressImage(file, {
          ...dimensions,
          quality: 0.6,
          format: 'webp',
        });
        setResult(recompressed);
        setPreview(URL.createObjectURL(recompressed.blob));
      } else {
        setResult(compressed);
        setPreview(URL.createObjectURL(compressed.blob));
      }
    } catch (err) {
      setError('Erreur lors de la compression');
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (result) {
      onUpload(result.blob, result);
      setPreview(null);
      setResult(null);
    }
  }

  function handleCancel() {
    setPreview(null);
    setResult(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">
          {type === 'avatar' ? 'Avatar / Logo' : 'Banniere'}
        </label>
        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          className="text-slate-400 hover:text-slate-300"
        >
          <Info size={16} />
        </button>
      </div>

      {showTips && (
        <div className="bg-slate-700/50 rounded-lg p-3 text-sm space-y-2">
          <p className="font-medium text-teal-400">Conseils de compression :</p>
          {compressionTips.map((tip, i) => (
            <div key={i}>
              <span className="text-slate-300">{tip.title} : </span>
              <span className="text-slate-400">{tip.content}</span>
            </div>
          ))}
        </div>
      )}

      <div
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
          type === 'avatar' ? 'w-32 h-32' : 'w-full h-32'
        } ${preview ? 'border-teal-500' : 'border-slate-600 hover:border-slate-500'}`}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <Loader size={24} className="text-teal-400 animate-spin" />
          </div>
        ) : preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : currentUrl ? (
          <img src={currentUrl} alt="Current" className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
            <ImageIcon size={24} />
            <span className="text-xs mt-1">Cliquez pour ajouter</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {result && (
        <div className="bg-slate-700/50 rounded-lg p-3 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400">Compression</span>
            <span className="text-teal-400 font-medium">
              -{result.compressionRatio.toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Avant : {formatFileSize(result.originalSize)}</span>
            <span>Apres : {formatFileSize(result.compressedSize)}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-white text-sm flex items-center justify-center gap-1"
            >
              <Check size={14} /> Confirmer
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="py-1.5 px-3 bg-slate-600 hover:bg-slate-500 rounded-lg text-white text-sm"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
