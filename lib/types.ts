// ---- Meal ----
export type Meal = 'breakfast' | 'lunch' | 'afternoon_tea' | 'dinner' | 'midnight_snack';

export const MEAL_OPTIONS: { value: Meal; label: string; emoji: string }[] = [
  { value: 'breakfast', label: '早饭', emoji: '🌅' },
  { value: 'lunch', label: '午饭', emoji: '☀️' },
  { value: 'afternoon_tea', label: '下午茶', emoji: '🫖' },
  { value: 'dinner', label: '晚饭', emoji: '🌇' },
  { value: 'midnight_snack', label: '夜宵', emoji: '🌙' },
];

// ---- Preferences (multi-select) ----
export type Taste = 'sweet' | 'salty' | 'spicy' | 'light' | 'heavy';
export type Budget = 'premium' | 'value';
export type Cuisine = 'chinese' | 'western' | 'japanese' | 'southeast_asian';
export type ChineseCuisine = 'lu' | 'chuan' | 'yue' | 'su' | 'zhe' | 'min' | 'xiang' | 'hui' | 'dongbei' | 'shanghai' | 'jiangxi' | 'hubei' | 'henan' | 'xibei';
export type DietaryRestriction = 'no_seafood' | 'no_shellfish' | 'no_cilantro';

export const TASTE_OPTIONS: { value: Taste; label: string; emoji: string }[] = [
  { value: 'sweet', label: '甜', emoji: '🍬' },
  { value: 'salty', label: '咸', emoji: '🧂' },
  { value: 'spicy', label: '辣', emoji: '🌶️' },
  { value: 'light', label: '清淡', emoji: '🥒' },
  { value: 'heavy', label: '重口', emoji: '🔥' },
];

export const BUDGET_OPTIONS: { value: Budget; label: string; emoji: string }[] = [
  { value: 'premium', label: '吃好点', emoji: '💎' },
  { value: 'value', label: '性价比', emoji: '💰' },
];

export const CUISINE_OPTIONS: { value: Cuisine; label: string; emoji: string }[] = [
  { value: 'chinese', label: '中餐', emoji: '🥢' },
  { value: 'western', label: '西餐', emoji: '🍝' },
  { value: 'japanese', label: '日料', emoji: '🍣' },
  { value: 'southeast_asian', label: '东南亚', emoji: '🍜' },
];

export const CHINESE_CUISINE_OPTIONS: { value: ChineseCuisine; label: string; emoji: string }[] = [
  { value: 'lu', label: '鲁菜', emoji: '🥘' },
  { value: 'chuan', label: '川菜', emoji: '🌶️' },
  { value: 'yue', label: '粤菜', emoji: '🥟' },
  { value: 'su', label: '苏菜', emoji: '🐟' },
  { value: 'zhe', label: '浙菜', emoji: '🦐' },
  { value: 'min', label: '闽菜', emoji: '🍲' },
  { value: 'xiang', label: '湘菜', emoji: '🔥' },
  { value: 'hui', label: '徽菜', emoji: '🍄' },
  { value: 'dongbei', label: '东北菜', emoji: '🥩' },
  { value: 'shanghai', label: '上海菜', emoji: '🦀' },
  { value: 'jiangxi', label: '江西菜', emoji: '🍚' },
  { value: 'hubei', label: '湖北菜', emoji: '🐌' },
  { value: 'henan', label: '河南菜', emoji: '🍜' },
  { value: 'xibei', label: '西北菜', emoji: '🐑' },
];

export const DIETARY_OPTIONS: { value: DietaryRestriction; label: string; emoji: string }[] = [
  { value: 'no_seafood', label: '不吃海鲜', emoji: '🐟' },
  { value: 'no_shellfish', label: '不吃虾蟹贝壳类', emoji: '🦐' },
  { value: 'no_cilantro', label: '不吃香菜', emoji: '🌿' },
];

// ---- Recommendation ----
export type Style = 'classic' | 'adventurous' | 'healthy' | 'comfort' | 'wildcard';

export const STYLE_LABELS: Record<Style, { label: string; emoji: string }> = {
  classic: { label: '经典稳妥', emoji: '🏛️' },
  adventurous: { label: '大胆尝鲜', emoji: '🚀' },
  healthy: { label: '健康轻食', emoji: '🥗' },
  comfort: { label: '碳水快乐', emoji: '🍜' },
  wildcard: { label: '惊喜盲盒', emoji: '🎲' },
};

export interface Recommendation {
  id: string;
  style: Style;
  name: string;
  reason: string;
  rating: number; // 1-5, increments of 0.5
  comment: string;
}

export interface RecommendRequest {
  meal: Meal;
  tastes: Taste[];
  budgets: Budget[];
  cuisines: Cuisine[];
  chineseCuisines: ChineseCuisine[];
  dietary: DietaryRestriction[];
  custom: string;
  rethinkStyle?: Style;
}

export interface RecommendResponse {
  recommendations: Recommendation[];
  generatedAt: string;
}

export interface ApiError {
  error: 'API_KEY_MISSING' | 'UPSTREAM_ERROR' | 'INVALID_RESPONSE' | 'RATE_LIMITED';
  message?: string;
}

export interface HistoryEntry {
  id: string;
  query: RecommendRequest;
  recommendations: Recommendation[];
  createdAt: string;
}
