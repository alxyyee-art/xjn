'use client';

import { useEffect } from 'react';

interface BackgroundProviderProps {
  images: string[];
  fallback: string;
}

export default function BackgroundProvider({ images, fallback }: BackgroundProviderProps) {
  useEffect(() => {
    const list = images.length > 0 ? images : [fallback];
    const picked = list[Math.floor(Math.random() * list.length)];
    document.body.style.setProperty('--bg-image', `url('${picked}')`);
  }, [images, fallback]);

  return null;
}
