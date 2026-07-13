import type { Promisable } from "type-fest";

import { useAlertStore } from "@/store/alert";
import { getResultAsync } from "@esposter/shared";

interface MutationOptions<TResult> {
  applyOptimistic?: () => () => void;
  onError?: (error: Error) => Promisable<void>;
  onSuccess?: (result: TResult) => Promisable<void>;
}

export const useMutation = () => {
  const { createAlert } = useAlertStore();
  let callId = 0;
  return async <TResult>(
    mutate: () => Promise<TResult>,
    { applyOptimistic, onError, onSuccess }: MutationOptions<TResult> = {},
  ) => {
    const id = ++callId;
    const checkIsStale = () => id !== callId;
    const rollback = applyOptimistic?.();
    await getResultAsync(mutate).match(
      async (result) => {
        if (!checkIsStale()) await onSuccess?.(result);
      },
      async (error) => {
        if (checkIsStale()) return;
        rollback?.();
        if (onError) await onError(error);
        else createAlert(error.message, "error");
      },
    );
  };
};
