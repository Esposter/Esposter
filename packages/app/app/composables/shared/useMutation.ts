import type { Promisable } from "type-fest";

import { getIsAlertedByErrorLink } from "@/services/trpc/errorLink";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, withFinalizerAsync } from "@esposter/shared";

interface MutationOptions<TResult> {
  applyOptimistic?: () => Promisable<() => void>;
  // Single-flight: drop the call outright while another call with the same key is still in flight
  isExclusive?: true;
  // The identity of the mutation's target, always explicit (like a Pinia store id): the entity id or
  // Natural composite for per-entity operations, a stable name for a singleton target (latest-wins),
  // Or a per-call Symbol(description) for independent creates with no natural key
  key: PropertyKey;
  onError?: (error: Error) => Promisable<void>;
  onSuccess?: (result: TResult) => Promisable<void>;
}

export const useMutation = () => {
  const { createAlert } = useAlertStore();
  // Staleness is latest-wins per key, so overlapping calls for different keys don't cancel each other
  const callIds = new Map<PropertyKey, number>();
  const pendingCounts = ref(new Map<PropertyKey, number>());
  const isPending = computed(() => pendingCounts.value.size > 0);
  // Per-key pending for per-item surfaces (a table row's own button), same getter idiom as getRoles(roomId)
  const getIsPending = (key: PropertyKey) => pendingCounts.value.has(key);
  const executeMutation = async <TResult>(
    mutate: () => Promise<TResult>,
    { applyOptimistic, isExclusive, key, onError, onSuccess }: MutationOptions<TResult>,
  ) => {
    if (isExclusive && pendingCounts.value.has(key)) return;

    const id = (callIds.get(key) ?? 0) + 1;
    callIds.set(key, id);
    const checkIsStale = () => id !== callIds.get(key);
    pendingCounts.value.set(key, (pendingCounts.value.get(key) ?? 0) + 1);
    // The finalizer guarantees pending bookkeeping unwinds even when applyOptimistic or a callback throws,
    // So a thrown callback can never strand the key as permanently pending
    await withFinalizerAsync(
      async () => {
        const rollback = await applyOptimistic?.();
        await getResultAsync(mutate).match(
          async (result) => {
            if (!checkIsStale()) await onSuccess?.(result);
          },
          async (error) => {
            if (checkIsStale()) return;
            rollback?.();
            if (onError) await onError(error);
            // The error link already put the codes it owns in front of the user, so alerting the same message here
            // Would stack two identical toasts on every mutation this primitive runs
            else if (!getIsAlertedByErrorLink(error)) createAlert(error.message, "error");
          },
        );
      },
      () => {
        const pendingCount = pendingCounts.value.get(key) ?? 0;
        if (pendingCount <= 1) {
          // No call remains in flight for this key, so its bookkeeping can be dropped wholesale
          pendingCounts.value.delete(key);
          callIds.delete(key);
        } else pendingCounts.value.set(key, pendingCount - 1);
      },
    );
  };
  return { executeMutation, getIsPending, isPending };
};
