import { useState, useRef } from 'react';
import {
  Plus, Trash2, Edit2, Download, Upload, Search, X, FileText,
  Link, StickyNote, Tag, Check, AlertCircle, FolderOpen, BookOpen
} from 'lucide-react';
import { CorpusItem, useLocalCorpus } from '../../hooks/useLocalCorpus';

type ItemType = CorpusItem['type'];

const TYPE_CONFIG: Record<ItemType, { label: string; icon: typeof FileText; color: string }> = {
  flashcard: { label: 'Flashcard', icon: BookOpen, color: 'emerald' },
  note: { label: 'Note', icon: StickyNote, color: 'amber' },
  document: { label: 'Document', icon: FileText, color: 'blue' },
  link: { label: 'Lien', icon: Link, color: 'purple' },
  custom: { label: 'Autre', icon: FolderOpen, color: 'teal' },
};

interface ItemFormData {
  type: ItemType;
  title: string;
  content: string;
  tags: string;
}

export function CorpusManager() {
  const corpus = useLocalCorpus();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<CorpusItem | null>(null);
  const [formData, setFormData] = useState<ItemFormData>({
    type: 'note',
    title: '',
    content: '',
    tags: '',
  });
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = corpus.items.filter(item => {
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !selectedType || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingItem) {
      corpus.updateItem(editingItem.id, {
        type: formData.type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags,
      });
      setEditingItem(null);
    } else {
      corpus.addItem({
        type: formData.type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags,
      });
    }

    setFormData({ type: 'note', title: '', content: '', tags: '' });
    setIsAddingItem(false);
  };

  const handleEdit = (item: CorpusItem) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      title: item.title,
      content: item.content,
      tags: item.tags.join(', '),
    });
    setIsAddingItem(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cet element ?')) {
      corpus.deleteItem(id);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = corpus.importCorpus(content, 'merge');
      if (result.success) {
        setImportStatus({ type: 'success', message: `${result.count} element(s) importe(s)` });
      } else {
        setImportStatus({ type: 'error', message: result.error || 'Erreur d\'import' });
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (confirm('Supprimer tout le corpus ? Cette action est irreversible.')) {
      corpus.clearAll();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="text-amber-400" />
            Mon Corpus Personnel
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {corpus.count} element(s) - Stocke localement sur votre appareil
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Importer</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={corpus.downloadExport}
            disabled={corpus.count === 0}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button
            onClick={() => {
              setIsAddingItem(true);
              setEditingItem(null);
              setFormData({ type: 'note', title: '', content: '', tags: '' });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors"
          >
            <Plus size={16} />
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {importStatus && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
          importStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {importStatus.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {importStatus.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans le corpus..."
            className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
              !selectedType ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Tout ({corpus.count})
          </button>
          {(Object.keys(TYPE_CONFIG) as ItemType[]).map(type => {
            const config = TYPE_CONFIG[type];
            const count = corpus.items.filter(i => i.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(selectedType === type ? null : type)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedType === type
                    ? `bg-${config.color}-500/20 text-${config.color}-400`
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <config.icon size={14} />
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {isAddingItem && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editingItem ? 'Modifier' : 'Nouvel element'}
            </h3>
            <button
              onClick={() => {
                setIsAddingItem(false);
                setEditingItem(null);
              }}
              className="p-1 hover:bg-slate-700 rounded"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TYPE_CONFIG) as ItemType[]).map(type => {
                  const config = TYPE_CONFIG[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setFormData(prev => ({ ...prev, type }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                        formData.type === type
                          ? `bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/50`
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-transparent'
                      }`}
                    >
                      <config.icon size={16} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Titre</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titre de l'element"
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Contenu</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Contenu, notes, reponse..."
                rows={6}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Tags (separes par des virgules)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="politique, education, exemple..."
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsAddingItem(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.title.trim() || !formData.content.trim()}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors disabled:opacity-50"
              >
                {editingItem ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
          {corpus.count === 0 ? (
            <>
              <FolderOpen size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400 mb-2">Votre corpus est vide</p>
              <p className="text-sm text-slate-500">
                Ajoutez des notes, flashcards ou documents pour les retrouver facilement
              </p>
            </>
          ) : (
            <>
              <Search size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">Aucun resultat pour cette recherche</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => {
            const config = TYPE_CONFIG[item.type];
            return (
              <div
                key={item.id}
                className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-${config.color}-500/20 text-${config.color}-400`}>
                    <config.icon size={20} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white truncate">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded bg-${config.color}-500/20 text-${config.color}-400`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{item.content}</p>
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.map((tag, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-400">
                            <Tag size={10} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      Cree le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {corpus.count > 0 && (
        <div className="flex justify-end pt-4 border-t border-slate-700">
          <button
            onClick={handleClearAll}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Supprimer tout le corpus
          </button>
        </div>
      )}
    </div>
  );
}
