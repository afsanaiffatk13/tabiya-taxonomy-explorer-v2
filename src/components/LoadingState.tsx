interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

/**
 * Simple loading spinner shown while data loads in background.
 * Used by pages that need taxonomy data.
 */
export default function LoadingState({
  message = 'Loading data...',
  subMessage,
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-tabiya-green border-t-transparent"></div>
      <p className="text-oxford-blue font-medium">{message}</p>
      {subMessage && (
        <p className="text-gray-500 text-sm mt-1">{subMessage}</p>
      )}
    </div>
  );
}
