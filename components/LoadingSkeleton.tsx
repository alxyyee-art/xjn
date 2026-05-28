'use client';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
          <div className="flex justify-between mb-3">
            <div className="h-6 w-20 bg-stone-200 rounded-full" />
            <div className="h-5 w-24 bg-stone-200 rounded" />
          </div>
          <div className="h-5 w-48 bg-stone-200 rounded mb-2" />
          <div className="h-4 w-full bg-stone-100 rounded mb-1" />
          <div className="h-4 w-3/4 bg-stone-100 rounded mb-3" />
          <div className="h-4 w-1/2 bg-stone-100 rounded" />
          <div className="flex gap-2 mt-4 pt-3 border-t border-stone-100">
            <div className="flex-1 h-9 bg-stone-100 rounded-lg" />
            <div className="flex-1 h-9 bg-stone-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
