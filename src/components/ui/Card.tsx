import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'highlight';
}

export default function Card({ children, className = '', variant = 'default' }: CardProps) {
  const variantStyles = {
    default: 'bg-white border-gray-200',
    highlight: 'bg-light-green border-green-3',
  };

  return (
    <div className={`rounded-lg border p-6 overflow-hidden ${variantStyles[variant]} ${className}`}>{children}</div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, className = '', as: Component = 'h3' }: CardTitleProps) {
  return (
    <Component className={`text-lg font-semibold text-oxford-blue ${className}`}>
      {children}
    </Component>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return <p className={`text-sm text-text-muted ${className}`}>{children}</p>;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`min-h-0 ${className}`}>{children}</div>;
}
