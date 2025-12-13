import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { HistoryEntry } from './networkTypes';

export interface NetworkControlsProps {
  history: HistoryEntry[];
  onClose: () => void;
  onHistoryClick: (index: number) => void;
  canGoBack: boolean;
  onGoBack: () => void;
}

/**
 * Controls for the network graph - back button and breadcrumb navigation
 */
export function NetworkControls({
  history,
  onClose,
  onHistoryClick,
  canGoBack,
  onGoBack,
}: NetworkControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      {/* Back to Results button */}
      <button
        onClick={onClose}
        className="
          inline-flex items-center gap-2 px-4 py-2
          text-sm font-medium text-oxford-blue
          bg-white border border-gray-300 rounded-full
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-tabiya-green
          transition-colors duration-150
          min-h-[44px]
        "
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Results
      </button>

      {/* Go Back in History */}
      {canGoBack && (
        <button
          onClick={onGoBack}
          className="
            inline-flex items-center gap-2 px-3 py-2
            text-sm font-medium text-green-3
            hover:text-oxford-blue focus:outline-none focus:ring-2 focus:ring-tabiya-green focus:ring-offset-2 rounded
            transition-colors duration-150
            min-h-[44px]
          "
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
      )}

      {/* Breadcrumb navigation */}
      <nav aria-label="Navigation history" className="flex-1">
        <ol className="flex flex-wrap items-center gap-1 text-sm">
          {history.map((entry, index) => {
            const isLast = index === history.length - 1;
            const isClickable = !isLast && history.length > 1;

            return (
              <li key={`${entry.id}-${index}`} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
                )}
                {isClickable ? (
                  <button
                    onClick={() => onHistoryClick(index)}
                    className="
                      text-green-3 hover:text-oxford-blue hover:underline
                      focus:outline-none focus:ring-2 focus:ring-tabiya-green focus:ring-offset-2 rounded
                      transition-colors duration-150
                      max-w-[150px] truncate
                    "
                    title={entry.label}
                  >
                    {entry.label}
                  </button>
                ) : (
                  <span
                    className="text-oxford-blue font-medium max-w-[200px] truncate"
                    title={entry.label}
                  >
                    {entry.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
