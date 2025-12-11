import { type ReactNode } from 'react';

type TagVariant = 'default' | 'seen' | 'unseen' | 'skill' | 'localized';

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
  className?: string;
}

const variantStyles: Record<TagVariant, string> = {
  default: 'bg-soft-green text-green-3 border-green-3',
  seen: 'bg-blue-50 text-blue-700 border-blue-300',
  unseen: 'bg-amber-50 text-amber-700 border-amber-300',
  skill: 'bg-purple-50 text-purple-700 border-purple-300',
  localized: 'bg-orange-50 text-orange-700 border-orange-300',
};

export default function Tag({ children, variant = 'default', className = '' }: TagProps) {
  return (
    <span
      className={`
        inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
