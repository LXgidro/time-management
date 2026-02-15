import type { ReactNode } from 'react';

interface SettingsLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingsLayout({
  title,
  description,
  children,
}: SettingsLayoutProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-2">{title}</h2>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      {children}
    </div>
  );
}
