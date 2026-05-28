'use client';

import type { Recommendation, Style } from '@/lib/types';
import RecommendationCard from './RecommendationCard';

interface RecommendationListProps {
  recommendations: Recommendation[];
  onRethink?: (style: Style) => void;
}

export default function RecommendationList({ recommendations, onRethink }: RecommendationListProps) {
  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} recommendation={rec} onRethink={onRethink} />
      ))}
    </div>
  );
}
