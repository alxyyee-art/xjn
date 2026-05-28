'use client';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenFavorites: () => void;
}

export default function Header({ onOpenHistory, onOpenFavorites }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/60">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight text-stone-800 flex items-center gap-2">
          <img src="/title.png" alt="" className="w-7 h-7 rounded-full object-cover border-2 border-amber-300" />
          嘉然今天吃什么
        </h1>
        <nav className="flex items-center gap-1">
          <button
            onClick={onOpenHistory}
            className="px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            aria-label="历史记录"
          >
            📋 历史
          </button>
          <button
            onClick={onOpenFavorites}
            className="px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            aria-label="收藏"
          >
            ❤️ 收藏
          </button>
        </nav>
      </div>
    </header>
  );
}
