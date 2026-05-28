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
