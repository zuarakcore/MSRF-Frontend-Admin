import { useCallback, useState } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { errorMessage } from './client';
import { useNotifications } from '../context/NotificationContext';

/**
 * Run a write against the API, toast the outcome and refetch the affected queries.
 * Returns true on success so callers can close modals / reset forms only then.
 */
export function useApiAction() {
  const { addToast } = useNotifications();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (
      action: () => Promise<unknown>,
      options: {
        success?: { title: string; message?: string; type?: 'success' | 'info' };
        errorTitle?: string;
        invalidate?: QueryKey[];
      } = {}
    ): Promise<boolean> => {
      setPending(true);
      try {
        await action();
        if (options.success) addToast({ type: options.success.type ?? 'success', ...options.success });
        return true;
      } catch (error) {
        addToast({ type: 'error', title: options.errorTitle ?? 'Action failed', message: errorMessage(error) });
        return false;
      } finally {
        await Promise.all((options.invalidate ?? []).map(queryKey => queryClient.invalidateQueries({ queryKey })));
        setPending(false);
      }
    },
    [addToast, queryClient]
  );

  return { run, pending };
}
