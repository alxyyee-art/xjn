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
