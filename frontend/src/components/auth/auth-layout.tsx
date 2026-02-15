import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-md">
        <h2 className="text-center text-2xl font-semibold mb-8 text-gray-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-center text-sm text-gray-600 mb-4">{subtitle}</p>
        )}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
