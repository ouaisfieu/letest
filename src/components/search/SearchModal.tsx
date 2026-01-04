import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, FileText, Gamepad2, BookOpen, FolderOpen, Tag, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CorpusItem } from '../../hooks/useLocalCorpus';

interface SearchResult {
  id: string;
  type: 'path' | 'lesson' | 'game' | 'goodie' | 'corpus' | 'flashcard';
  title: string;
  description: string;
  tags?: string[];
  icon: typeof FileText;
  onClick: () => void;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  corpusItems: CorpusItem[];
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export function SearchModal({ isOpen, onClose, corpusItems, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const lowerQuery = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    const corpusResults = corpusItems
      .filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 5)
      .map(item => ({
        id: `corpus-${item.id}`,
        type: 'corpus' as const,
        title: item.title,
        description: item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''),
        tags: item.tags,
        icon: FolderOpen,
        onClick: () => {
          onNavigate('settings');
          onClose();
        },
      }));
    searchResults.push(...corpusResults);

    try {
      const [pathsResult, lessonsResult, collectionsResult, goodiesResult] = await Promise.all([
        supabase
          .from('learning_paths')
          .select('id, title, description')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .eq('is_published', true)
          .limit(3),
        supabase
          .from('lessons')
          .select('id, title, summary, module_id')
          .or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`)
          .eq('is_published', true)
          .limit(5),
        supabase
          .from('game_collections')
          .select('id, title, description')
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .eq('is_published', true)
          .limit(3),
        supabase
          .from('goodies')
          .select('id, title, short_description, tags')
          .or(`title.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%`)
          .eq('is_published', true)
          .limit(3),
      ]);

      if (pathsResult.data) {
        pathsResult.data.forEach(path => {
          searchResults.push({
            id: `path-${path.id}`,
            type: 'path',
            title: path.title,
            description: path.description || '',
            icon: BookOpen,
            onClick: () => {
              onNavigate('path-detail', { pathId: path.id });
              onClose();
            },
          });
        });
      }

      if (lessonsResult.data) {
        lessonsResult.data.forEach(lesson => {
          searchResults.push({
            id: `lesson-${lesson.id}`,
            type: 'lesson',
            title: lesson.title,
            description: lesson.summary || '',
            icon: FileText,
            onClick: () => {
              onNavigate('lesson', { lessonId: lesson.id });
              onClose();
            },
          });
        });
      }

      if (collectionsResult.data) {
        collectionsResult.data.forEach(collection => {
          searchResults.push({
            id: `game-${collection.id}`,
            type: 'game',
            title: collection.title,
            description: collection.description || '',
            icon: Gamepad2,
            onClick: () => {
              onNavigate('game-play', { collectionId: collection.id });
              onClose();
            },
          });
        });
      }

      if (goodiesResult.data) {
        goodiesResult.data.forEach(goodie => {
          searchResults.push({
            id: `goodie-${goodie.id}`,
            type: 'goodie',
            title: goodie.title,
            description: goodie.short_description || '',
            tags: goodie.tags,
            icon: Tag,
            onClick: () => {
              onNavigate('goodie-detail', { goodieId: goodie.id });
              onClose();
            },
          });
        });
      }

      const cardsResult = await supabase
        .from('game_cards')
        .select('id, front_content, collection_id')
        .eq('is_active', true)
        .limit(50);

      if (cardsResult.data) {
        cardsResult.data
          .filter(card => {
            const content = card.front_content as { text?: string };
            return content?.text?.toLowerCase().includes(lowerQuery);
          })
          .slice(0, 5)
          .forEach(card => {
            const content = card.front_content as { text?: string };
            searchResults.push({
              id: `card-${card.id}`,
              type: 'flashcard',
              title: content?.text?.substring(0, 60) + '...' || 'Flashcard',
              description: 'Carte de jeu educatif',
              icon: Gamepad2,
              onClick: () => {
                onNavigate('game-play', { collectionId: card.collection_id });
                onClose();
              },
            });
          });
      }
    } catch (error) {
      console.error('Search error:', error);
    }

    setResults(searchResults);
    setIsSearching(false);
  }, [corpusItems, onNavigate, onClose]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query, performSearch]);

  const filteredResults = activeFilter
    ? results.filter(r => r.type === activeFilter)
    : results;

  const filters = [
    { key: null, label: 'Tout' },
    { key: 'corpus', label: 'Mon corpus' },
    { key: 'path', label: 'Parcours' },
    { key: 'lesson', label: 'Lecons' },
    { key: 'game', label: 'Jeux' },
    { key: 'goodie', label: 'Goodies' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
          <Search size={20} className="text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans tout le contenu..."
            className="flex-1 bg-transparent text-white text-lg outline-none placeholder-slate-500"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-xs text-slate-400">
            ESC
          </kbd>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700 overflow-x-auto">
          {filters.map(filter => (
            <button
              key={filter.key || 'all'}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeFilter === filter.key
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {filter.label}
              {filter.key && (
                <span className="ml-1 text-xs opacity-60">
                  ({results.filter(r => r.type === filter.key).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : query && filteredResults.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400">Aucun resultat pour "{query}"</p>
              <p className="text-sm text-slate-500 mt-1">Essayez avec d'autres termes</p>
            </div>
          ) : !query ? (
            <div className="py-12 text-center">
              <Search size={40} className="mx-auto text-slate-600 mb-3" />
              <p className="text-slate-400">Tapez pour rechercher</p>
              <p className="text-sm text-slate-500 mt-1">
                Parcours, lecons, jeux, goodies et votre corpus personnel
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredResults.map((result) => (
                <button
                  key={result.id}
                  onClick={result.onClick}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors text-left group"
                >
                  <div className={`p-2 rounded-lg ${
                    result.type === 'corpus' ? 'bg-amber-500/20 text-amber-400' :
                    result.type === 'path' ? 'bg-emerald-500/20 text-emerald-400' :
                    result.type === 'lesson' ? 'bg-blue-500/20 text-blue-400' :
                    result.type === 'game' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-teal-500/20 text-teal-400'
                  }`}>
                    <result.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{result.title}</p>
                    <p className="text-sm text-slate-400 truncate">{result.description}</p>
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {result.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 mt-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
            <span>{filteredResults.length} resultat(s)</span>
            <div className="flex items-center gap-2">
              <Clock size={12} />
              <span>Recherche instantanee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
