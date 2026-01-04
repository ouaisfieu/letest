export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export interface CompressionResult {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'webp',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let { width, height } = img;
      const aspectRatio = width / height;

      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = format === 'png' ? 'image/png' :
                       format === 'webp' ? 'image/webp' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not compress image'));
            return;
          }

          resolve({
            blob,
            width,
            height,
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio: ((file.size - blob.size) / file.size) * 100,
          });
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('Could not load image'));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} octets`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

export const compressionTips = [
  {
    title: 'Choisir le bon format',
    content: 'JPEG pour les photos, PNG pour les logos/texte, WebP pour le meilleur compromis.',
  },
  {
    title: 'Redimensionner d\'abord',
    content: 'Une image de 4000px pour un avatar de 200px gaspille de la bande passante.',
  },
  {
    title: 'Qualite optimale',
    content: '70-85% de qualite JPEG est souvent indistinguable de 100% pour l\'oeil humain.',
  },
  {
    title: 'Supprimer les metadonnees',
    content: 'Les EXIF peuvent ajouter des Ko inutiles et compromettre votre vie privee.',
  },
];
