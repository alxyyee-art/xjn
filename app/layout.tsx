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
