import { useState, useEffect, useCallback } from 'react';

export interface CorpusItem {
  id: string;
  type: 'flashcard' | 'note' | 'document' | 'link' | 'custom';
  title: string;
  content: string;
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface LocalCorpus {
  version: string;
  items: CorpusItem[];
  exportedAt?: string;
}

const STORAGE_KEY = 'user_corpus';
const CURRENT_VERSION = '1.0';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadFromStorage(): CorpusItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as LocalCorpus;
    return parsed.items || [];
  } catch {
    return [];
  }
}

function saveToStorage(items: CorpusItem[]): void {
  const corpus: LocalCorpus = {
    version: CURRENT_VERSION,
    items,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(corpus));
}

export function useLocalCorpus() {
  const [items, setItems] = useState<CorpusItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadFromStorage();
    setItems(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage(items);
    }
  }, [items, isLoaded]);

  const addItem = useCallback((item: Omit<CorpusItem, 'id' | 'createdAt' | 'updatedAt'>): CorpusItem => {
    const now = new Date().toISOString();
    const newItem: CorpusItem = {
      ...item,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setItems(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Omit<CorpusItem, 'id' | 'createdAt'>>): void => {
    setItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    ));
  }, []);

  const deleteItem = useCallback((id: string): void => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearAll = useCallback((): void => {
    setItems([]);
  }, []);

  const search = useCallback((query: string): CorpusItem[] => {
    if (!query.trim()) return items;
    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.content.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [items]);

  const exportCorpus = useCallback((): string => {
    const corpus: LocalCorpus = {
      version: CURRENT_VERSION,
      items,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(corpus, null, 2);
  }, [items]);

  const importCorpus = useCallback((jsonString: string, mode: 'replace' | 'merge' = 'merge'): { success: boolean; count: number; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString) as LocalCorpus;
      if (!parsed.items || !Array.isArray(parsed.items)) {
        return { success: false, count: 0, error: 'Format invalide: items manquants' };
      }

      const validItems = parsed.items.filter(item =>
        item.id && item.title && item.content && item.type
      );

      if (mode === 'replace') {
        setItems(validItems);
      } else {
        setItems(prev => {
          const existingIds = new Set(prev.map(i => i.id));
          const newItems = validItems.filter(i => !existingIds.has(i.id));
          return [...prev, ...newItems];
        });
      }

      return { success: true, count: validItems.length };
    } catch (e) {
      return { success: false, count: 0, error: 'JSON invalide' };
    }
  }, []);

  const downloadExport = useCallback((): void => {
    const content = exportCorpus();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corpus-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportCorpus]);

  return {
    items,
    isLoaded,
    addItem,
    updateItem,
    deleteItem,
    clearAll,
    search,
    exportCorpus,
    importCorpus,
    downloadExport,
    count: items.length,
  };
}
