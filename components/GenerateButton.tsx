'use client';

import { useState, useEffect } from 'react';

interface GenerateButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
}

const LOADING_TEXTS = [
  '正在翻冰箱…',
  '正在问大厨…',
  '正在尝味道…',
  '正在摆盘…',
  '正在想搭配…',
];

export default function GenerateButton({ onClick, loading, disabled }: GenerateButtonProps) {
  const [loadingText, setLoadingText] = useState(LOADING_TEXTS[0]);

  useEffect(() => {
    if (loading) {
      setLoadingText(LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]);
    }
  }, [loading]);

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-3.5 px-6 rounded-2xl text-base font-bold transition-all duration-200
        ${disabled || loading
          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
          : 'bg-amber-500 text-white shadow-lg shadow-amber-200 hover:bg-amber-600 active:scale-[0.98]'
        }`}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {loadingText}
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          🔥 AI 推荐
        </span>
      )}
    </button>
  );
}
