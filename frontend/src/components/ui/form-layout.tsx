import type { ReactNode } from 'react';

interface FormLayoutProps {
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function FormLayout({
  title,
  children,
  maxWidth = 'md',
}: FormLayoutProps) {
  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto mt-8`}>
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      {children}
    </div>
  );
}
