'use client';

import type { HistoryEntry } from '@/lib/types';
import { getHistory, clearHistory } from '@/lib/storage';
import { useEffect, useState } from 'react';
import { STYLE_LABELS } from '@/lib/types';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (entry: HistoryEntry) => void;
}

export default function HistoryDrawer({ open, onClose, onSelect }: HistoryDrawerProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (open) setHistory(getHistory());
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <h2 className="font-bold text-lg text-stone-800">📋 历史记录</h2>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={() => { clearHistory(); setHistory([]); }}
                className="text-xs text-stone-400 hover:text-red-500 transition-colors"
              >
                清空
              </button>
            )}
            <button onClick={onClose} className="text-xl text-stone-400 hover:text-stone-600 transition-colors">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {history.length === 0 ? (
            <p className="text-center text-stone-400 py-16">暂无历史记录</p>
          ) : (
            <div className="p-4 space-y-3">
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => { onSelect(entry); onClose(); }}
                  className="w-full text-left p-4 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
                >
                  <p className="text-sm font-medium text-stone-800 mb-1">
                    {entry.query.meal === 'breakfast' && '🌅 早饭'}
                    {entry.query.meal === 'lunch' && '☀️ 午饭'}
                    {entry.query.meal === 'afternoon_tea' && '🫖 下午茶'}
                    {entry.query.meal === 'dinner' && '🌇 晚饭'}
                    {entry.query.meal === 'midnight_snack' && '🌙 夜宵'}
                    <span className="text-stone-400 font-normal ml-2 text-xs">
                      {new Date(entry.createdAt).toLocaleString('zh-CN')}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {entry.recommendations.slice(0, 3).map((r) => (
                      <span key={r.id} className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                        {STYLE_LABELS[r.style].emoji} {r.name}
                      </span>
                    ))}
                    {entry.recommendations.length > 3 && (
                      <span className="text-xs text-stone-400">+{entry.recommendations.length - 3}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
