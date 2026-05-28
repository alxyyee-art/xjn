import type { Recommendation, HistoryEntry } from './types';

const FAVORITES_KEY = 'eating-lab-favorites';
const HISTORY_KEY = 'eating-lab-history';
const MAX_HISTORY = 50;

// ---- Favorites ----
export function getFavorites(): Recommendation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addFavorite(rec: Recommendation): void {
  const favs = getFavorites();
  if (favs.some((f) => f.id === rec.id)) return;
  favs.unshift(rec);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function removeFavorite(id: string): void {
  const favs = getFavorites().filter((f) => f.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

// ---- History ----
export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistory(entry: HistoryEntry): void {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
}
