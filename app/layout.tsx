import type { Metadata } from 'next';
import { readdirSync } from 'fs';
import { join } from 'path';
import './globals.css';

export const metadata: Metadata = {
  title: '嘉然今天吃什么',
  description: '嘉然帮你决定每顿吃什么，5 种风格推荐，告别选择困难',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  let bgImage = '/background.jpg'; // fallback

  try {
    const bgDir = join(process.cwd(), 'public', 'backgrounds');
    const files = readdirSync(bgDir).filter((f) => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));
    if (files.length > 0) {
      const randomFile = files[Math.floor(Math.random() * files.length)];
      bgImage = `/backgrounds/${randomFile}`;
    }
  } catch {
    // fallback to default
  }

  return (
    <html lang="zh-CN">
      <body className="min-h-screen" style={{ '--bg-image': `url('${bgImage}')` } as React.CSSProperties}>
        {children}
      </body>
    </html>
  );
}
