import { memo } from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  id: string;
  label: string;
  type: string;
}

interface BreadcrumbProps {
  path: BreadcrumbItem[];
  onNavigate: (id: string, type: string) => void;
}

function BreadcrumbComponent({ path, onNavigate }: BreadcrumbProps) {
  if (path.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        <li className="flex items-center text-text-muted">
          <Home className="h-4 w-4" />
        </li>
        {path.map((item, index) => {
          const isLast = index === path.length - 1;

          return (
            <li key={item.id} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-text-muted" />
              {isLast ? (
                <span className="font-medium text-oxford-blue" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(item.id, item.type)}
                  className="text-green-3 transition-colors hover:text-oxford-blue hover:underline"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export const Breadcrumb = memo(BreadcrumbComponent);
