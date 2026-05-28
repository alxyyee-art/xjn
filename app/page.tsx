'use client';

import { useState, useCallback } from 'react';
import type { Meal, Taste, Budget, Cuisine, ChineseCuisine, DietaryRestriction, Recommendation, HistoryEntry, ApiError, Style } from '@/lib/types';
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
  const [chineseCuisines, setChineseCuisines] = useState<ChineseCuisine[]>([]);
  const [dietary, setDietary] = useState<DietaryRestriction[]>([]);
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
        body: JSON.stringify({ meal, tastes, budgets, cuisines, chineseCuisines, dietary, custom }),
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
        query: { meal, tastes, budgets, cuisines, chineseCuisines, dietary, custom },
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
  }, [meal, tastes, budgets, cuisines, chineseCuisines, dietary, custom]);

  // ---- Rethink single card ----
  const handleRethink = useCallback(async (style: Style) => {
    if (!meal || pageState.phase !== 'result') return;

    // Keep current recommendations, mark the one being rethought
    const oldRecs = pageState.recommendations;
    setPageState({ phase: 'loading' });

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal, tastes, budgets, cuisines, chineseCuisines, dietary, custom, rethinkStyle: style }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPageState({ phase: 'error', error: data as ApiError });
        return;
      }

      // Replace only the rethought card
      const newRec = data.recommendations[0];
      const updated = oldRecs.map((r) => r.style === style ? newRec : r);
      setPageState({ phase: 'result', recommendations: updated });
    } catch {
      setPageState({
        phase: 'error',
        error: { error: 'UPSTREAM_ERROR', message: '网络连接失败，请检查网络后重试' },
      });
    }
  }, [meal, tastes, budgets, cuisines, chineseCuisines, dietary, custom, pageState]);

  // ---- History select ----
  function handleHistorySelect(entry: HistoryEntry) {
    setMeal(entry.query.meal);
    setTastes(entry.query.tastes || []);
    setBudgets(entry.query.budgets || []);
    setCuisines(entry.query.cuisines || []);
    setChineseCuisines(entry.query.chineseCuisines || []);
    setDietary(entry.query.dietary || []);
    setCustom(entry.query.custom || '');
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
            cuisines={cuisines} onCuisinesChange={(c) => {
              // Auto-clear Chinese sub-cuisines when 中餐 is deselected
              if (!c.includes('chinese')) setChineseCuisines([]);
              setCuisines(c);
            }}
            chineseCuisines={chineseCuisines} onChineseCuisinesChange={setChineseCuisines}
            dietary={dietary} onDietaryChange={setDietary}
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
          <RecommendationList recommendations={pageState.recommendations} onRethink={handleRethink} />
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
        嘉然今天吃什么 · Powered by DeepSeek
      </footer>

      {/* Drawers */}
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} onSelect={handleHistorySelect} />
      <FavoritesDrawer open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </div>
  );
}
