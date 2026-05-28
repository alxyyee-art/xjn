'use client';

import type { Recommendation, Style } from '@/lib/types';
import { STYLE_LABELS } from '@/lib/types';
import StarRating from './StarRating';
import { useState } from 'react';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/storage';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onFavoriteChange?: () => void;
  onRethink?: (style: Style) => void;
}

export default function RecommendationCard({ recommendation, onFavoriteChange, onRethink }: RecommendationCardProps) {
  const { id, style, name, reason, rating, comment } = recommendation;
  const styleInfo = STYLE_LABELS[style];
  const [fav, setFav] = useState(() => isFavorite(id));

  function handleCopy() {
    const text = `【${styleInfo.emoji} ${styleInfo.label}】${name}\n⭐ ${rating}/5\n💡 ${reason}\n💬 ${comment}\n—— 嘉然今天吃什么 推荐`;
    navigator.clipboard.writeText(text).catch(() => {
      prompt('手动复制', text);
    });
  }

  function handleFavorite() {
    if (fav) {
      removeFavorite(id);
      setFav(false);
    } else {
      addFavorite(recommendation);
      setFav(true);
    }
    onFavoriteChange?.();
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Top row: style badge + name + rating */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="chip chip--selected text-xs cursor-default">
          {styleInfo.emoji} {styleInfo.label}
        </span>
        <StarRating rating={rating} />
      </div>

      <h3 className="text-lg font-bold text-stone-800 mb-2">{name}</h3>
      <p className="text-sm text-stone-600 mb-2 leading-relaxed">
        <span className="text-stone-400">💡</span> {reason}
      </p>
      <p className="text-sm text-stone-500 italic leading-relaxed">
        <span className="text-stone-400">💬</span> {comment}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100">
        <button
          onClick={handleCopy}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          📋 复制
        </button>
        <button
          onClick={handleFavorite}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
            ${fav ? 'text-red-500 hover:bg-red-50' : 'text-stone-500 hover:text-red-400 hover:bg-stone-100'}`}
        >
          {fav ? '❤️ 已收藏' : '🤍 收藏'}
        </button>
        <button
          onClick={() => onRethink?.(style)}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-stone-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
        >
          🔄 不满意
        </button>
      </div>
    </div>
  );
}
