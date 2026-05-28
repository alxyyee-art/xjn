'use client';

import type { Taste, Budget, Cuisine } from '@/lib/types';
import { TASTE_OPTIONS, BUDGET_OPTIONS, CUISINE_OPTIONS } from '@/lib/types';
import ChipGroup from './ChipGroup';
import CustomInput from './CustomInput';

interface PreferencePanelProps {
  tastes: Taste[];
  onTastesChange: (tastes: Taste[]) => void;
  budgets: Budget[];
  onBudgetsChange: (budgets: Budget[]) => void;
  cuisines: Cuisine[];
  onCuisinesChange: (cuisines: Cuisine[]) => void;
  custom: string;
  onCustomChange: (custom: string) => void;
}

export default function PreferencePanel({
  tastes, onTastesChange,
  budgets, onBudgetsChange,
  cuisines, onCuisinesChange,
  custom, onCustomChange,
}: PreferencePanelProps) {
  return (
    <div className="space-y-4">
      {/* 口味 */}
      <div>
        <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">口味偏好</p>
        <ChipGroup options={TASTE_OPTIONS} value={tastes} onChange={onTastesChange} />
      </div>

      {/* 价位 */}
      <div>
        <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">价位偏好</p>
        <ChipGroup options={BUDGET_OPTIONS} value={budgets} onChange={onBudgetsChange} />
      </div>

      {/* 菜系 */}
      <div>
        <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">菜系偏好</p>
        <ChipGroup options={CUISINE_OPTIONS} value={cuisines} onChange={onCuisinesChange} />
      </div>

      {/* 其他 */}
      <div>
        <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">其他要求</p>
        <CustomInput value={custom} onChange={onCustomChange} />
      </div>
    </div>
  );
}
