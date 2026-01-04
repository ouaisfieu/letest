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

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result.map(v => v.replace(/^["']|["']$/g, ''));
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

  const parseCSV = useCallback((content: string): CorpusItem[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const delimiter = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

    const titleIdx = headers.findIndex(h => ['title', 'titre', 'question', 'term', 'front'].includes(h));
    const contentIdx = headers.findIndex(h => ['content', 'contenu', 'answer', 'reponse', 'definition', 'back', 'response'].includes(h));
    const typeIdx = headers.findIndex(h => ['type', 'categorie', 'category'].includes(h));
    const tagsIdx = headers.findIndex(h => ['tags', 'tag', 'labels', 'keywords'].includes(h));

    const now = new Date().toISOString();
    const items: CorpusItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i], delimiter);
      if (values.length < 2) continue;

      const title = titleIdx >= 0 ? values[titleIdx]?.trim() : values[0]?.trim();
      const content = contentIdx >= 0 ? values[contentIdx]?.trim() : values[1]?.trim();

      if (!title || !content) continue;

      let type: CorpusItem['type'] = 'note';
      if (typeIdx >= 0 && values[typeIdx]) {
        const typeVal = values[typeIdx].toLowerCase().trim();
        if (['flashcard', 'note', 'document', 'link', 'custom'].includes(typeVal)) {
          type = typeVal as CorpusItem['type'];
        } else if (['question', 'qa', 'term', 'front'].includes(typeVal)) {
          type = 'flashcard';
        }
      } else if (headers.some(h => ['question', 'term', 'front'].includes(h))) {
        type = 'flashcard';
      }

      let tags: string[] = [];
      if (tagsIdx >= 0 && values[tagsIdx]) {
        tags = values[tagsIdx].split(/[,|]/).map(t => t.trim()).filter(Boolean);
      }

      items.push({
        id: generateId(),
        type,
        title,
        content,
        tags,
        createdAt: now,
        updatedAt: now,
      });
    }

    return items;
  }, []);

  const parseMarkdown = useCallback((content: string, filename: string): CorpusItem[] => {
    const now = new Date().toISOString();
    const items: CorpusItem[] = [];

    const sections = content.split(/^#{1,3}\s+/m).filter(s => s.trim());

    if (sections.length <= 1) {
      const title = filename.replace(/\.(md|txt)$/i, '').replace(/[-_]/g, ' ');
      items.push({
        id: generateId(),
        type: 'document',
        title,
        content: content.trim(),
        tags: [],
        createdAt: now,
        updatedAt: now,
      });
    } else {
      for (const section of sections) {
        const lines = section.split('\n');
        const title = lines[0]?.trim();
        const body = lines.slice(1).join('\n').trim();

        if (title && body) {
          items.push({
            id: generateId(),
            type: 'note',
            title,
            content: body,
            tags: [],
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    return items;
  }, []);

  const parsePlainText = useCallback((content: string, filename: string): CorpusItem[] => {
    const now = new Date().toISOString();
    const title = filename.replace(/\.(txt|md)$/i, '').replace(/[-_]/g, ' ');

    return [{
      id: generateId(),
      type: 'document',
      title,
      content: content.trim(),
      tags: [],
      createdAt: now,
      updatedAt: now,
    }];
  }, []);

  const importFromFile = useCallback((content: string, filename: string, mode: 'replace' | 'merge' = 'merge'): { success: boolean; count: number; error?: string } => {
    try {
      const ext = filename.split('.').pop()?.toLowerCase() || '';
      let newItems: CorpusItem[] = [];

      if (ext === 'json') {
        return importCorpus(content, mode);
      } else if (ext === 'csv') {
        newItems = parseCSV(content);
      } else if (ext === 'md') {
        newItems = parseMarkdown(content, filename);
      } else if (ext === 'txt') {
        newItems = parsePlainText(content, filename);
      } else {
        newItems = parsePlainText(content, filename);
      }

      if (newItems.length === 0) {
        return { success: false, count: 0, error: 'Aucun element trouve dans le fichier' };
      }

      if (mode === 'replace') {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }

      return { success: true, count: newItems.length };
    } catch (e) {
      return { success: false, count: 0, error: 'Erreur de lecture du fichier' };
    }
  }, [importCorpus, parseCSV, parseMarkdown, parsePlainText]);

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
    importFromFile,
    downloadExport,
    count: items.length,
  };
}
