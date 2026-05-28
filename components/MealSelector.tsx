'use client';

import type { Meal } from '@/lib/types';
import { MEAL_OPTIONS } from '@/lib/types';

interface MealSelectorProps {
  value: Meal | null;
  onChange: (meal: Meal) => void;
}

export default function MealSelector({ value, onChange }: MealSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {MEAL_OPTIONS.map((m) => {
        const isSelected = value === m.value;
        return (
          <button
            key={m.value}
            onClick={() => onChange(m.value)}
            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-150 text-sm
              ${isSelected
                ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-sm'
                : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700'
              }`}
          >
            <span className="text-xl">{m.emoji}</span>
            <span className="font-medium text-xs">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
