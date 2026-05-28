# AI Eating Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page AI meal recommendation app where users pick meal type + multi-select preferences, DeepSeek generates 5 combo-meal recommendations with different styles, supporting copy/favorite/history.

**Architecture:** Next.js 15 App Router with a single API Route (`/api/recommend`) that calls DeepSeek via OpenAI-compatible SDK. All state lives in React + localStorage. No database, no auth. Tailwind CSS for styling, mobile-first responsive.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, DeepSeek API (openai SDK), localStorage

---

## File Structure

```
e:\work\
├── .env.local.example          # Template (safe to commit)
├── .env.local                  # Actual key (gitignored)
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── postcss.config.mjs
├── app/
│   ├── layout.tsx              # Root layout, metadata
│   ├── page.tsx                # Main page — composes all components
│   ├── globals.css             # Tailwind directives + custom base styles
│   └── api/
│       └── recommend/
│           └── route.ts        # POST handler — calls DeepSeek
├── lib/
│   ├── types.ts                # All shared TypeScript types
│   ├── storage.ts              # localStorage get/set helpers
│   └── prompt.ts               # Builds DeepSeek chat prompt from user selections
└── components/
    ├── Header.tsx              # Logo + history & favorites icon buttons
    ├── MealSelector.tsx         # 5 meal-type selectable cards (single select)
    ├── ChipGroup.tsx            # Reusable multi-select chip group
    ├── PreferencePanel.tsx      # Wraps ChipGroups + CustomInput
    ├── CustomInput.tsx          # Free-text "other" input
    ├── GenerateButton.tsx       # Main CTA with loading state
    ├── RecommendationList.tsx   # Container for recommendation cards
    ├── RecommendationCard.tsx   # Single card: style badge, name, stars, reason, comment, actions
    ├── StarRating.tsx           # Visual 1-5 star display
    ├── HistoryDrawer.tsx        # Right slide-in drawer for history
    ├── FavoritesDrawer.tsx      # Right slide-in drawer for favorites
    ├── ErrorBanner.tsx          # Dismissable error banner
    ├── LoadingSkeleton.tsx      # Skeleton placeholder while generating
    └── EmptyState.tsx           # Shown before first generation
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.local.example`, `app/globals.css`, `app/layout.tsx`

- [ ] **Step 1: Create Next.js project**

Run: `cd e:/work && npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-turbopack --use-npm`

Expected: Project scaffolds in place. Answer "Yes" to overwrite if prompted (the dir has only .claude and .vscode).

- [ ] **Step 2: Install additional dependencies**

Run: `cd e:/work && npm install openai`

Expected: openai SDK installed for calling DeepSeek.

- [ ] **Step 3: Create .env.local.example**

Write `e:/work/.env.local.example`:

```
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

- [ ] **Step 4: Verify .gitignore covers .env.local**

Run: `grep -n "env.local" e:/work/.gitignore`

Expected: Should show `.env.local` or `.env*.local` is listed. If not, append `.env.local` to `.gitignore`.

- [ ] **Step 5: Verify dev server starts**

Run: `cd e:/work && npm run dev` (run in background, check it starts without errors)

Expected: `Ready in ...` at `http://localhost:3000`

Stop the dev server after confirming.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "$(cat <<'EOF'
chore: scaffold Next.js project with Tailwind

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Types and Constants

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Write types file**

Write `e:/work/lib/types.ts`:

```ts
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
  custom: string;
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts && git commit -m "$(cat <<'EOF'
feat: add types and constants for meal selection, preferences, and recommendations

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: localStorage Helpers

**Files:**
- Create: `lib/storage.ts`

- [ ] **Step 1: Write storage helpers**

Write `e:/work/lib/storage.ts`:

```ts
import type { Recommendation, HistoryEntry } from './types';

const FAVORITES_KEY = 'eating-lab-favorites';
const HISTORY_KEY = 'eating-lab-history';
const MAX_HISTORY = 50;

// ---- Favorites ----
export function getFavorites(): Recommendation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addFavorite(rec: Recommendation): void {
  const favs = getFavorites();
  if (favs.some((f) => f.id === rec.id)) return;
  favs.unshift(rec);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function removeFavorite(id: string): void {
  const favs = getFavorites().filter((f) => f.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

export function isFavorite(id: string): boolean {
  return getFavorites().some((f) => f.id === id);
}

// ---- History ----
export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistory(entry: HistoryEntry): void {
  const history = getHistory();
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/storage.ts && git commit -m "$(cat <<'EOF'
feat: add localStorage helpers for favorites and history

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: DeepSeek Prompt Builder

**Files:**
- Create: `lib/prompt.ts`

- [ ] **Step 1: Write prompt builder**

Write `e:/work/lib/prompt.ts`:

```ts
import type { RecommendRequest, Recommendation } from './types';
import { MEAL_OPTIONS, TASTE_OPTIONS, BUDGET_OPTIONS, CUISINE_OPTIONS } from './types';

function describeMeal(meal: string): string {
  return MEAL_OPTIONS.find((m) => m.value === meal)?.label ?? meal;
}

function describeOptions(opts: { value: string; label: string }[], selected: string[]): string {
  if (selected.length === 0) return '无特殊要求';
  return selected
    .map((s) => opts.find((o) => o.value === s)?.label ?? s)
    .join(' + ');
}

export function buildRecommendPrompt(req: RecommendRequest): string {
  const mealLabel = describeMeal(req.meal);
  const tasteDesc = describeOptions(TASTE_OPTIONS, req.tastes);
  const budgetDesc = describeOptions(BUDGET_OPTIONS, req.budgets);
  const cuisineDesc = describeOptions(CUISINE_OPTIONS, req.cuisines);

  return `你是一位资深美食推荐师，用户需要推荐一顿"${mealLabel}"。

偏好：
- 口味：${tasteDesc}
- 价位：${budgetDesc}
- 菜系：${cuisineDesc}
${req.custom ? `- 额外要求：${req.custom}` : ''}

要求：
1. 生成 5 条推荐，每条对应一种风格——「经典稳妥」「大胆尝鲜」「健康轻食」「碳水快乐」「惊喜盲盒」
2. 每条推荐必须是**组合餐**（一套搭配完整的餐食，如主菜+配菜+饮品/甜点），而非单一菜品
3. 如果用户选了多种口味（如甜+咸），要包含甜咸搭配的菜品组合
4. 推荐要具体、接地气、符合中国用户的饮食习惯认知

请严格按以下 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "recommendations": [
    {
      "style": "classic",
      "name": "组合餐名称",
      "reason": "推荐理由（2-3句话，说明为什么搭配合理）",
      "rating": 4.5,
      "comment": "一句话简评（有趣、接地气）"
    }
  ]
}

style 必须是以下之一：classic, adventurous, healthy, comfort, wildcard
rating 为 1.0-5.0 之间的数字，保留一位小数`;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/prompt.ts && git commit -m "$(cat <<'EOF'
feat: add DeepSeek prompt builder with combo-meal instructions

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: API Route — POST /api/recommend

**Files:**
- Create: `app/api/recommend/route.ts`

- [ ] **Step 1: Write API route**

Write `e:/work/app/api/recommend/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { buildRecommendPrompt } from '@/lib/prompt';
import type { RecommendRequest, RecommendResponse, ApiError, Recommendation } from '@/lib/types';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

export async function POST(request: NextRequest) {
  // 1. Check API key
  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json<ApiError>(
      { error: 'API_KEY_MISSING', message: '请在 .env.local 中配置 DEEPSEEK_API_KEY' },
      { status: 500 }
    );
  }

  // 2. Parse request
  let body: RecommendRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiError>(
      { error: 'UPSTREAM_ERROR', message: '请求格式错误' },
      { status: 400 }
    );
  }

  // 3. Validate required fields
  if (!body.meal) {
    return NextResponse.json<ApiError>(
      { error: 'UPSTREAM_ERROR', message: '请选择餐段' },
      { status: 400 }
    );
  }

  // 4. Call DeepSeek
  const client = new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: DEEPSEEK_BASE_URL,
  });

  try {
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一位专业的美食推荐师，输出严格 JSON，不含 markdown 标记。' },
        { role: 'user', content: buildRecommendPrompt(body) },
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json<ApiError>(
        { error: 'INVALID_RESPONSE', message: 'AI 没有返回内容，稍后再试' },
        { status: 502 }
      );
    }

    // 5. Parse & validate response
    let parsed: { recommendations: Recommendation[] };
    try {
      // Strip possible markdown code fence
      const cleaned = raw.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json<ApiError>(
        { error: 'INVALID_RESPONSE', message: 'AI 返回格式异常，换组偏好试试' },
        { status: 502 }
      );
    }

    if (!Array.isArray(parsed.recommendations) || parsed.recommendations.length === 0) {
      return NextResponse.json<ApiError>(
        { error: 'INVALID_RESPONSE', message: 'AI 没想出合适的推荐，换组偏好试试' },
        { status: 502 }
      );
    }

    // Add IDs if missing
    const recommendations = parsed.recommendations.map((r, i) => ({
      ...r,
      id: r.id || crypto.randomUUID(),
    }));

    const response: RecommendResponse = {
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    // DeepSeek rate limiting / server errors
    if (msg.includes('rate') || msg.includes('429')) {
      return NextResponse.json<ApiError>(
        { error: 'RATE_LIMITED', message: 'AI 厨师忙不过来了，稍等几秒再试' },
        { status: 429 }
      );
    }
    return NextResponse.json<ApiError>(
      { error: 'UPSTREAM_ERROR', message: `AI 服务异常：${msg}` },
      { status: 502 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/recommend/route.ts && git commit -m "$(cat <<'EOF'
feat: add /api/recommend POST route calling DeepSeek

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Layout and Global Styles

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Write global styles**

Write (overwrite) `e:/work/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-stone-50 text-stone-900 antialiased;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB",
      "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  }
}

@layer components {
  .chip {
    @apply inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
           border cursor-pointer select-none transition-all duration-150
           border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-800;
  }
  .chip--selected {
    @apply border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-200;
  }
}

@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #d6d3d1 transparent;
  }
}
```

- [ ] **Step 2: Write root layout**

Write (overwrite) `e:/work/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Eating Lab — 这顿吃什么？',
  description: 'AI 帮你决定每顿吃什么，5 种风格推荐，告别选择困难',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Verify layout compiles**

Run: `cd e:/work && npx tsc --noEmit`

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx && git commit -m "$(cat <<'EOF'
feat: configure global styles and root layout with Chinese font stack

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Header Component

**Files:**
- Create: `components/Header.tsx`

- [ ] **Step 1: Write Header**

Write `e:/work/components/Header.tsx`:

```tsx
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
          🍽️ AI Eating Lab
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
```

- [ ] **Step 2: Commit**

```bash
git add components/Header.tsx && git commit -m "$(cat <<'EOF'
feat: add Header component with history and favorites buttons

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: MealSelector Component

**Files:**
- Create: `components/MealSelector.tsx`

- [ ] **Step 1: Write MealSelector**

Write `e:/work/components/MealSelector.tsx`:

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/MealSelector.tsx && git commit -m "$(cat <<'EOF'
feat: add MealSelector component with 5 meal types

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: ChipGroup and CustomInput Components

**Files:**
- Create: `components/ChipGroup.tsx`
- Create: `components/CustomInput.tsx`

- [ ] **Step 1: Write ChipGroup**

Write `e:/work/components/ChipGroup.tsx`:

```tsx
'use client';

interface ChipOption {
  value: string;
  label: string;
  emoji: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  value: string[];
  onChange: (selected: string[]) => void;
}

export default function ChipGroup({ options, value, onChange }: ChipGroupProps) {
  function toggle(val: string) {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`chip ${selected ? 'chip--selected' : ''}`}
          >
            <span>{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Write CustomInput**

Write `e:/work/components/CustomInput.tsx`:

```tsx
'use client';

interface CustomInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomInput({ value, onChange }: CustomInputProps) {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="还有别的想法？写在这里…（比如：想吃开胃的、最近上火）"
        maxLength={100}
        className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm
                   placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300
                   focus:border-amber-400 transition-shadow"
      />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ChipGroup.tsx components/CustomInput.tsx && git commit -m "$(cat <<'EOF'
feat: add reusable ChipGroup and CustomInput components

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: PreferencePanel Component

**Files:**
- Create: `components/PreferencePanel.tsx`

- [ ] **Step 1: Write PreferencePanel**

Write `e:/work/components/PreferencePanel.tsx`:

```tsx
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
        <ChipGroup options={TASTE_OPTIONS} value={tastes} onChange={onTastesChange as (s: string[]) => void} />
      </div>

      {/* 价位 */}
      <div>
        <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">价位偏好</p>
        <ChipGroup options={BUDGET_OPTIONS} value={budgets} onChange={onBudgetsChange as (s: string[]) => void} />
      </div>

      {/* 菜系 */}
      <div>
        <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">菜系偏好</p>
        <ChipGroup options={CUISINE_OPTIONS} value={cuisines} onChange={onCuisinesChange as (s: string[]) => void} />
      </div>

      {/* 其他 */}
      <div>
        <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">其他要求</p>
        <CustomInput value={custom} onChange={onCustomChange} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/PreferencePanel.tsx && git commit -m "$(cat <<'EOF'
feat: add PreferencePanel composing ChipGroups and CustomInput

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: GenerateButton Component

**Files:**
- Create: `components/GenerateButton.tsx`

- [ ] **Step 1: Write GenerateButton**

Write `e:/work/components/GenerateButton.tsx`:

```tsx
'use client';

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
          {LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)]}
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          🔥 AI 推荐
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/GenerateButton.tsx && git commit -m "$(cat <<'EOF'
feat: add GenerateButton with loading spinner and animated texts

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: StarRating and RecommendationCard Components

**Files:**
- Create: `components/StarRating.tsx`
- Create: `components/RecommendationCard.tsx`

- [ ] **Step 1: Write StarRating**

Write `e:/work/components/StarRating.tsx`:

```tsx
'use client';

interface StarRatingProps {
  rating: number; // 1-5, steps of 0.5
}

export default function StarRating({ rating }: StarRatingProps) {
  const stars: ('full' | 'half' | 'empty')[] = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push('full');
    } else if (rating >= i - 0.5) {
      stars.push('half');
    } else {
      stars.push('empty');
    }
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400" aria-label={`评分 ${rating} 星`}>
      {stars.map((s, i) => (
        <span key={i}>
          {s === 'full' ? '★' : s === 'half' ? '⯨' : '☆'}
        </span>
      ))}
      <span className="text-xs text-stone-400 ml-1">{rating}</span>
    </span>
  );
}
```

- [ ] **Step 2: Write RecommendationCard**

Write `e:/work/components/RecommendationCard.tsx`:

```tsx
'use client';

import type { Recommendation } from '@/lib/types';
import { STYLE_LABELS } from '@/lib/types';
import StarRating from './StarRating';
import { useState } from 'react';
import { addFavorite, removeFavorite, isFavorite } from '@/lib/storage';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { id, style, name, reason, rating, comment } = recommendation;
  const styleInfo = STYLE_LABELS[style];
  const [fav, setFav] = useState(() => isFavorite(id));

  function handleCopy() {
    const text = `【${styleInfo.emoji} ${styleInfo.label}】${name}\n⭐ ${rating}/5\n💡 ${reason}\n💬 ${comment}\n—— AI Eating Lab 推荐`;
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
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/StarRating.tsx components/RecommendationCard.tsx && git commit -m "$(cat <<'EOF'
feat: add StarRating and RecommendationCard with copy and favorite actions

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: RecommendationList, ErrorBanner, LoadingSkeleton, EmptyState

**Files:**
- Create: `components/RecommendationList.tsx`
- Create: `components/ErrorBanner.tsx`
- Create: `components/LoadingSkeleton.tsx`
- Create: `components/EmptyState.tsx`

- [ ] **Step 1: Write RecommendationList**

Write `e:/work/components/RecommendationList.tsx`:

```tsx
'use client';

import type { Recommendation } from '@/lib/types';
import RecommendationCard from './RecommendationCard';

interface RecommendationListProps {
  recommendations: Recommendation[];
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} recommendation={rec} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write ErrorBanner**

Write `e:/work/components/ErrorBanner.tsx`:

```tsx
'use client';

interface ErrorBannerProps {
  title: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorBanner({ title, message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
      <p className="text-lg mb-1">😿</p>
      <p className="font-bold text-red-700 mb-1">{title}</p>
      <p className="text-sm text-red-600 mb-3">{message}</p>
      <div className="flex justify-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            重试
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl border border-red-300 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
          >
            关闭
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write LoadingSkeleton**

Write `e:/work/components/LoadingSkeleton.tsx`:

```tsx
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
```

- [ ] **Step 4: Write EmptyState**

Write `e:/work/components/EmptyState.tsx`:

```tsx
'use client';

export default function EmptyState() {
  return (
    <div className="text-center py-16 px-4">
      <p className="text-5xl mb-4">🍜</p>
      <p className="text-lg font-bold text-stone-500 mb-1">今天吃什么？</p>
      <p className="text-sm text-stone-400">选好餐段和偏好，让 AI 帮你决定</p>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/RecommendationList.tsx components/ErrorBanner.tsx components/LoadingSkeleton.tsx components/EmptyState.tsx && git commit -m "$(cat <<'EOF'
feat: add RecommendationList, ErrorBanner, LoadingSkeleton, and EmptyState components

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: HistoryDrawer and FavoritesDrawer

**Files:**
- Create: `components/HistoryDrawer.tsx`
- Create: `components/FavoritesDrawer.tsx`

- [ ] **Step 1: Write HistoryDrawer**

Write `e:/work/components/HistoryDrawer.tsx`:

```tsx
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
```

- [ ] **Step 2: Write FavoritesDrawer**

Write `e:/work/components/FavoritesDrawer.tsx`:

```tsx
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

      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
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
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/HistoryDrawer.tsx components/FavoritesDrawer.tsx && git commit -m "$(cat <<'EOF'
feat: add HistoryDrawer and FavoritesDrawer with slide-in panels

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: Main Page — Compose Everything

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write main page**

Write (overwrite) `e:/work/app/page.tsx`:

```tsx
'use client';

import { useState, useCallback } from 'react';
import type { Meal, Taste, Budget, Cuisine, Recommendation, HistoryEntry, ApiError } from '@/lib/types';
import { addHistory } from '@/lib/storage';
import Header from '@/components/Header';
import MealSelector from '@/components/MealSelector';
import PreferencePanel from '@/components/PreferencePanel';
import GenerateButton from '@/components/GenerateButton';
import RecommendationList from '@/components/RecommendationList';
import ErrorBanner from '@/components/ErrorBanner';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import HistoryDrawer from '@/components/HistoryDrawer';
import FavoritesDrawer from '@/components/FavoritesDrawer';

type PageState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'result'; recommendations: Recommendation[] }
  | { phase: 'error'; error: ApiError };

export default function HomePage() {
  // ---- Selection state ----
  const [meal, setMeal] = useState<Meal | null>(null);
  const [tastes, setTastes] = useState<Taste[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [custom, setCustom] = useState('');

  // ---- Page state ----
  const [pageState, setPageState] = useState<PageState>({ phase: 'idle' });

  // ---- Drawer state ----
  const [historyOpen, setHistoryOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  // ---- Generate ----
  const handleGenerate = useCallback(async () => {
    if (!meal) return;

    setPageState({ phase: 'loading' });

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal, tastes, budgets, cuisines, custom }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPageState({ phase: 'error', error: data as ApiError });
        return;
      }

      setPageState({ phase: 'result', recommendations: data.recommendations });

      // Save to history
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        query: { meal, tastes, budgets, cuisines, custom },
        recommendations: data.recommendations,
        createdAt: new Date().toISOString(),
      };
      addHistory(entry);
    } catch {
      setPageState({
        phase: 'error',
        error: { error: 'UPSTREAM_ERROR', message: '网络连接失败，请检查网络后重试' },
      });
    }
  }, [meal, tastes, budgets, cuisines, custom]);

  // ---- History select ----
  function handleHistorySelect(entry: HistoryEntry) {
    setMeal(entry.query.meal);
    setTastes(entry.query.tastes);
    setBudgets(entry.query.budgets);
    setCuisines(entry.query.cuisines);
    setCustom(entry.query.custom);
    setPageState({ phase: 'result', recommendations: entry.recommendations });
  }

  // ---- Render ----
  const canGenerate = meal !== null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenFavorites={() => setFavoritesOpen(true)}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Step 1: Meal */}
        <section>
          <p className="text-xs font-medium text-stone-400 mb-2 uppercase tracking-wider">选一顿</p>
          <MealSelector value={meal} onChange={setMeal} />
        </section>

        {/* Step 2: Preferences */}
        <section>
          <PreferencePanel
            tastes={tastes} onTastesChange={setTastes}
            budgets={budgets} onBudgetsChange={setBudgets}
            cuisines={cuisines} onCuisinesChange={setCuisines}
            custom={custom} onCustomChange={setCustom}
          />
        </section>

        {/* Generate Button */}
        <GenerateButton
          onClick={handleGenerate}
          loading={pageState.phase === 'loading'}
          disabled={!canGenerate}
        />

        {/* Results Area */}
        {pageState.phase === 'idle' && <EmptyState />}
        {pageState.phase === 'loading' && <LoadingSkeleton />}
        {pageState.phase === 'result' && (
          <RecommendationList recommendations={pageState.recommendations} />
        )}
        {pageState.phase === 'error' && (
          <ErrorBanner
            title="出错了"
            message={pageState.error.message || '未知错误'}
            onRetry={handleGenerate}
            onDismiss={() => setPageState({ phase: 'idle' })}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-stone-300">
        Powered by DeepSeek
      </footer>

      {/* Drawers */}
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} onSelect={handleHistorySelect} />
      <FavoritesDrawer open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx && git commit -m "$(cat <<'EOF'
feat: compose main page with all components, state flow, and drawer management

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Slide-in Animation and Mobile Polish

**Files:**
- Modify: `app/globals.css` (append animation)
- Verify: All components responsive at 375px width

- [ ] **Step 1: Add slide-in animation**

Append to `e:/work/app/globals.css`:

```css
@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.animate-slide-in {
  animation: slide-in 0.2s ease-out;
}
```

- [ ] **Step 2: Mobile verification checkpoints**

Verify these specific behaviors at `< 640px` width:
- MealSelector: 5 columns stays readable, emoji sizes appropriate
- ChipGroup: chips wrap to next line, tap targets at least 44px
- RecommendationCard: full width, no horizontal scroll
- Drawers: `max-w-sm` → `w-full` covers the entire screen width on small phones
- GenerateButton: full width

All of these should already be handled by the existing Tailwind classes. Verify by running `npm run dev` and checking in browser dev tools at 375px.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css && git commit -m "$(cat <<'EOF'
feat: add slide-in animation for drawers, verify mobile responsiveness

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: End-to-End Verification

- [ ] **Step 1: Verify all imports and types compile**

Run: `cd e:/work && npx tsc --noEmit`

Expected: No errors.

- [ ] **Step 2: Verify dev build succeeds**

Run: `cd e:/work && npm run build`

Expected: Successful build with no errors.

- [ ] **Step 3: Manual test checklist**

With `npm run dev` running and `.env.local` configured with a real `DEEPSEEK_API_KEY`:

1. Open `http://localhost:3000` — see empty state
2. Select "午饭" — meal card highlights
3. Select "甜" + "咸" — both chips highlighted
4. Select "性价比" — chip highlighted
5. Select "日料" + "中餐" — both highlighted
6. Click "AI 推荐" — loading skeleton appears
7. Wait for response — 5 recommendation cards render
8. Click "复制" on a card — clipboard has formatted text
9. Click "收藏" — heart fills, card appears in favorites drawer
10. Open "历史" drawer — entry listed
11. Click history entry — reloads that result
12. Resize to 375px — layout adapts correctly

Without API key:
1. Remove `.env.local` or set invalid key
2. Restart dev server
3. Click "AI 推荐" — error banner shows clear message

- [ ] **Step 4: Final commit (if any fixes from verification)**

```bash
git add -A && git commit -m "$(cat <<'EOF'
chore: final verification fixes

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Implementation Order

```
Task 1  → Scaffolding
Task 2  → Types
Task 3  → localStorage
Task 4  → Prompt builder
Task 5  → API route
Task 6  → Layout & styles
Task 7  → Header
Task 8  → MealSelector
Task 9  → ChipGroup + CustomInput
Task 10 → PreferencePanel
Task 11 → GenerateButton
Task 12 → StarRating + RecommendationCard
Task 13 → List + Error + Skeleton + Empty
Task 14 → HistoryDrawer + FavoritesDrawer
Task 15 → Main page (composition)
Task 16 → Animation + mobile polish
Task 17 → Verification
```
