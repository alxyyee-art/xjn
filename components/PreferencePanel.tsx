'use client';

import type { Taste, Budget, Cuisine, ChineseCuisine, DietaryRestriction } from '@/lib/types';
import { TASTE_OPTIONS, BUDGET_OPTIONS, CUISINE_OPTIONS, CHINESE_CUISINE_OPTIONS, DIETARY_OPTIONS } from '@/lib/types';
import ChipGroup from './ChipGroup';
import CustomInput from './CustomInput';

interface PreferencePanelProps {
  tastes: Taste[];
  onTastesChange: (tastes: Taste[]) => void;
  budgets: Budget[];
  onBudgetsChange: (budgets: Budget[]) => void;
  cuisines: Cuisine[];
  onCuisinesChange: (cuisines: Cuisine[]) => void;
  chineseCuisines: ChineseCuisine[];
  onChineseCuisinesChange: (cuisines: ChineseCuisine[]) => void;
  dietary: DietaryRestriction[];
  onDietaryChange: (dietary: DietaryRestriction[]) => void;
  custom: string;
  onCustomChange: (custom: string) => void;
}

export default function PreferencePanel({
  tastes, onTastesChange,
  budgets, onBudgetsChange,
  cuisines, onCuisinesChange,
  chineseCuisines, onChineseCuisinesChange,
  dietary, onDietaryChange,
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

      {/* 中餐子菜系 — 仅当选中中餐时显示 */}
      {cuisines.includes('chinese') && (
        <div className="pl-3 border-l-2 border-amber-300">
          <p className="text-xs font-medium text-amber-600 mb-2 uppercase tracking-wider">中餐细分菜系</p>
          <ChipGroup options={CHINESE_CUISINE_OPTIONS} value={chineseCuisines} onChange={onChineseCuisinesChange} />
        </div>
      )}

      {/* 忌口 / 特殊要求 */}
      <div>
        <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">特殊要求</p>
        <ChipGroup options={DIETARY_OPTIONS} value={dietary} onChange={onDietaryChange} />
      </div>

      {/* 其他 */}
      <div>
        <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">其他想法</p>
        <CustomInput value={custom} onChange={onCustomChange} />
      </div>
    </div>
  );
}
