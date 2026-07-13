import type { Promisable } from "type-fest";

import { useAlertStore } from "@/store/alert";
import { getResultAsync } from "@esposter/shared";

interface MutationOptions<TResult> {
  applyOptimistic?: () => () => void;
  onSuccess?: (result: TResult) => Promisable<void>;
}

export const useMutation = () => {
  const { createAlert } = useAlertStore();
  let callId = 0;
  return async <TResult>(
    mutate: () => Promise<TResult>,
    { applyOptimistic, onSuccess }: MutationOptions<TResult> = {},
  ) => {
    const id = ++callId;
    const checkIsStale = () => id !== callId;
    const rollback = applyOptimistic?.();
    await getResultAsync(mutate).match(
      async (result) => {
        if (!checkIsStale()) await onSuccess?.(result);
      },
      (error) => {
        if (checkIsStale()) return;
        rollback?.();
        createAlert(error.message, "error");
      },
    );
  };
};
