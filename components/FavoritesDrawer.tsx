'use client';

import type { Recommendation } from '@/lib/types';
import { getFavorites } from '@/lib/storage';
import { useEffect, useState } from 'react';
import RecommendationCard from './RecommendationCard';

interface FavoritesDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function FavoritesDrawer({ open, onClose }: FavoritesDrawerProps) {
  const [favorites, setFavorites] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (open) setFavorites(getFavorites());
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h2 className="font-bold text-lg text-stone-800">❤️ 收藏</h2>
          <button onClick={onClose} className="text-xl text-stone-400 hover:text-stone-600 transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {favorites.length === 0 ? (
            <p className="text-center text-stone-400 py-16">暂无收藏</p>
          ) : (
            <div className="p-4 space-y-4">
              {favorites.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} onFavoriteChange={() => setFavorites(getFavorites())} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
