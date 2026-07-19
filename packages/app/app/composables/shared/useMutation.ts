import type { Promisable } from "type-fest";

import { useAlertStore } from "@/store/alert";
import { getResultAsync } from "@esposter/shared";

interface MutationOptions<TResult> {
  applyOptimistic?: () => Promisable<() => void>;
  // Single-flight: drop the call outright while another call with the same key is still in flight
  isExclusive?: true;
  key?: PropertyKey;
  onError?: (error: Error) => Promisable<void>;
  onSuccess?: (result: TResult) => Promisable<void>;
}

const DEFAULT_KEY = Symbol("useMutation");

export const useMutation = () => {
  const { createAlert } = useAlertStore();
  // Staleness is latest-wins per key, so overlapping calls for different keys don't cancel each other
  const callIds = new Map<PropertyKey, number>();
  const pendingCounts = ref(new Map<PropertyKey, number>());
  const isPending = computed(() => pendingCounts.value.size > 0);
  const executeMutation = async <TResult>(
    mutate: () => Promise<TResult>,
    { applyOptimistic, isExclusive, key = DEFAULT_KEY, onError, onSuccess }: MutationOptions<TResult> = {},
  ) => {
    if (isExclusive && pendingCounts.value.has(key)) return;

    const id = (callIds.get(key) ?? 0) + 1;
    callIds.set(key, id);
    const checkIsStale = () => id !== callIds.get(key);
    pendingCounts.value.set(key, (pendingCounts.value.get(key) ?? 0) + 1);
    const rollback = await applyOptimistic?.();
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
    const pendingCount = pendingCounts.value.get(key) ?? 0;
    if (pendingCount <= 1) {
      // No call remains in flight for this key, so its bookkeeping can be dropped wholesale
      pendingCounts.value.delete(key);
      callIds.delete(key);
    } else pendingCounts.value.set(key, pendingCount - 1);
  };
  return { executeMutation, isPending };
};
