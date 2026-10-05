import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { TableSkeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { errorMessage } from '../../api/client';

/**
 * Loading / error placeholder for API-backed screens. Renders children once data is ready.
 * `isLoading` is true only on the first load, so refetches keep showing the current data.
 */
export const QueryState: React.FC<{
  isLoading: boolean;
  error: unknown;
  onRetry?: () => void;
  rows?: number;
  children: React.ReactNode;
}> = ({ isLoading, error, onRetry, rows = 6, children }) => {
  if (isLoading) return <TableSkeleton rows={rows} />;
  if (error)
    return (
      <EmptyState
        icon={<AlertTriangle className="w-7 h-7 text-rose-500" />}
        title="Could not load data"
        description={errorMessage(error)}
        actionLabel={onRetry ? 'Try again' : undefined}
        onAction={onRetry}
      />
    );
  return <>{children}</>;
};
