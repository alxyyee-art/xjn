import type { Metadata } from 'next';
import { readdirSync } from 'fs';
import { join } from 'path';
import './globals.css';
import BackgroundProvider from '@/components/BackgroundProvider';

export const metadata: Metadata = {
  title: '嘉然今天吃什么',
  description: '嘉然帮你决定每顿吃什么，5 种风格推荐，告别选择困难',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const bgImages: string[] = [];
  const fallback = '/background.jpg';

  try {
    const bgDir = join(process.cwd(), 'public', 'backgrounds');
    const files = readdirSync(bgDir).filter((f) => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));
    bgImages.push(...files.map((f) => `/backgrounds/${f}`));
  } catch {
    // empty list, fallback will be used
  }

  return (
    <html lang="zh-CN">
      <body className="min-h-screen" style={{ '--bg-image': `url('${fallback}')` } as React.CSSProperties}>
        {children}
        <BackgroundProvider images={bgImages} fallback={fallback} />
      </body>
    </html>
  );
}
