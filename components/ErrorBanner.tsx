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
