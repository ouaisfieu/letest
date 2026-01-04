import { useState, useEffect } from 'react';
import {
  Plus,
  Upload,
  Download,
  Trash2,
  Edit3,
  Save,
  X,
  Layers,
  CheckSquare,
  Link,
  GitBranch,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GameCollection, GameCard, GameType } from '../../types';

const GAME_TYPE_ICONS: Record<string, React.ElementType> = {
  flashcards: Layers,
  mcq: CheckSquare,
  matching: Link,
  scenario: GitBranch,
};

export function AdminPage() {
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [collections, setCollections] = useState<GameCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<GameCard | null>(null);
  const [showNewCard, setShowNewCard] = useState(false);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCardForm, setNewCardForm] = useState({ question: '', answer: '', explanation: '', difficulty: 1 });
  const [newCollectionForm, setNewCollectionForm] = useState({ title: '', description: '', gameTypeId: '', difficulty: 1 });
  const [csvImport, setCsvImport] = useState('');
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      loadCards(selectedCollection);
    }
  }, [selectedCollection]);

  async function loadData() {
    const [typesResult, collectionsResult] = await Promise.all([
      supabase.from('game_types').select('*').eq('is_active', true),
      supabase.from('game_collections').select('*, game_types(*)').order('order_index'),
    ]);
    if (typesResult.data) setGameTypes(typesResult.data as GameType[]);
    if (collectionsResult.data) {
      setCollections(collectionsResult.data.map((c) => ({ ...c, game_type: c.game_types })) as GameCollection[]);
    }
    setLoading(false);
  }

  async function loadCards(collectionId: string) {
    const { data } = await supabase
      .from('game_cards')
      .select('*')
      .eq('collection_id', collectionId)
      .order('order_index');
    if (data) setCards(data as GameCard[]);
  }

  async function handleCreateCollection() {
    if (!newCollectionForm.title || !newCollectionForm.gameTypeId) return;
    const slug = newCollectionForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { error } = await supabase.from('game_collections').insert({
      game_type_id: newCollectionForm.gameTypeId,
      slug,
      title: newCollectionForm.title,
      description: newCollectionForm.description,
      difficulty_level: newCollectionForm.difficulty,
      xp_reward: newCollectionForm.difficulty * 50,
    });
    if (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la creation' });
    } else {
      setMessage({ type: 'success', text: 'Collection creee!' });
      setShowNewCollection(false);
      setNewCollectionForm({ title: '', description: '', gameTypeId: '', difficulty: 1 });
      loadData();
    }
  }

  async function handleCreateCard() {
    if (!selectedCollection || !newCardForm.question || !newCardForm.answer) return;
    const { error } = await supabase.from('game_cards').insert({
      collection_id: selectedCollection,
      card_type: 'flashcard',
      front_content: { type: 'question', text: newCardForm.question },
      back_content: { type: 'answer', text: newCardForm.answer, explanation: newCardForm.explanation },
      hints: [],
      tags: [],
      difficulty: newCardForm.difficulty,
      points: newCardForm.difficulty * 10,
      order_index: cards.length,
    });
    if (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la creation' });
    } else {
      setMessage({ type: 'success', text: 'Carte creee!' });
      setShowNewCard(false);
      setNewCardForm({ question: '', answer: '', explanation: '', difficulty: 1 });
      loadCards(selectedCollection);
    }
  }

  async function handleDeleteCard(cardId: string) {
    if (!confirm('Supprimer cette carte?')) return;
    await supabase.from('game_cards').delete().eq('id', cardId);
    if (selectedCollection) loadCards(selectedCollection);
  }

  async function handleImportCsv() {
    if (!selectedCollection || !csvImport.trim()) return;
    const lines = csvImport.trim().split('\n');
    const cardsToInsert = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 2) {
        cardsToInsert.push({
          collection_id: selectedCollection,
          card_type: 'flashcard',
          front_content: { type: 'question', text: parts[0] },
          back_content: { type: 'answer', text: parts[1], explanation: parts[2] || '' },
          hints: [],
          tags: [],
          difficulty: 2,
          points: 15,
          order_index: cards.length + i,
        });
      }
    }
    if (cardsToInsert.length > 0) {
      const { error } = await supabase.from('game_cards').insert(cardsToInsert);
      if (error) {
        setMessage({ type: 'error', text: 'Erreur lors de l\'import' });
      } else {
        setMessage({ type: 'success', text: `${cardsToInsert.length} cartes importees!` });
        setCsvImport('');
        setShowCsvImport(false);
        loadCards(selectedCollection);
      }
    }
  }

  function handleExportCsv() {
    const csvContent = [
      'question,answer,explanation',
      ...cards.map((c) => {
        const front = c.front_content as { text: string };
        const back = c.back_content as { text: string; explanation?: string };
        return `"${front.text}","${back.text}","${back.explanation || ''}"`;
      }),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cards-export.csv';
    a.click();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion du Contenu</h1>
          <p className="text-slate-400">Creez et modifiez les collections de jeux educatifs</p>
        </div>
        <button
          onClick={() => setShowNewCollection(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
        >
          <Plus size={18} />
          Nouvelle collection
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          }`}
        >
          <AlertCircle size={18} />
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-auto">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Collections</h2>
            <div className="space-y-2">
              {collections.map((col) => {
                const Icon = GAME_TYPE_ICONS[col.game_type?.slug || 'flashcards'] || Layers;
                return (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollection(col.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedCollection === col.id
                        ? 'bg-emerald-500/20 border border-emerald-500/30'
                        : 'hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={18} className="text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{col.title}</p>
                      <p className="text-xs text-slate-400">{col.game_type?.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedCollection ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Cartes ({cards.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCsvImport(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                  >
                    <Upload size={14} />
                    Importer CSV
                  </button>
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                  >
                    <Download size={14} />
                    Exporter
                  </button>
                  <button
                    onClick={() => setShowNewCard(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                  >
                    <Plus size={14} />
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {cards.map((card, idx) => {
                  const front = card.front_content as { text: string };
                  const back = card.back_content as { text: string };
                  return (
                    <div
                      key={card.id}
                      className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg"
                    >
                      <span className="text-slate-500 text-sm w-6">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{front.text}</p>
                        <p className="text-slate-400 text-xs truncate">{back.text}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {cards.length === 0 && (
                  <p className="text-center text-slate-500 py-8">Aucune carte. Ajoutez-en une!</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
              <FileText size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Selectionnez une collection pour voir et modifier ses cartes</p>
            </div>
          )}
        </div>
      </div>

      {showNewCollection && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Nouvelle Collection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Titre</label>
                <input
                  type="text"
                  value={newCollectionForm.title}
                  onChange={(e) => setNewCollectionForm({ ...newCollectionForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Ex: Vocabulaire economique"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea
                  value={newCollectionForm.description}
                  onChange={(e) => setNewCollectionForm({ ...newCollectionForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Type de jeu</label>
                <select
                  value={newCollectionForm.gameTypeId}
                  onChange={(e) => setNewCollectionForm({ ...newCollectionForm, gameTypeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="">Choisir...</option>
                  {gameTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Difficulte (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newCollectionForm.difficulty}
                  onChange={(e) => setNewCollectionForm({ ...newCollectionForm, difficulty: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewCollection(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateCollection}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                Creer
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewCard && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-lg font-bold text-white mb-4">Nouvelle Carte</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Question</label>
                <textarea
                  value={newCardForm.question}
                  onChange={(e) => setNewCardForm({ ...newCardForm, question: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Reponse</label>
                <textarea
                  value={newCardForm.answer}
                  onChange={(e) => setNewCardForm({ ...newCardForm, answer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Explication (optionnel)</label>
                <textarea
                  value={newCardForm.explanation}
                  onChange={(e) => setNewCardForm({ ...newCardForm, explanation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Difficulte (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newCardForm.difficulty}
                  onChange={(e) => setNewCardForm({ ...newCardForm, difficulty: parseInt(e.target.value) || 1 })}
                  className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewCard(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateCard}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                Creer
              </button>
            </div>
          </div>
        </div>
      )}

      {showCsvImport && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full">
            <h3 className="text-lg font-bold text-white mb-4">Importer des cartes (CSV)</h3>
            <p className="text-sm text-slate-400 mb-4">
              Format: question,reponse,explication (une ligne par carte, premiere ligne = en-tetes)
            </p>
            <textarea
              value={csvImport}
              onChange={(e) => setCsvImport(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
              rows={10}
              placeholder={`question,answer,explanation\n"Qu'est-ce que l'IE?","L'intelligence economique...","Definition complete"`}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCsvImport(false); setCsvImport(''); }}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleImportCsv}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg"
              >
                Importer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
