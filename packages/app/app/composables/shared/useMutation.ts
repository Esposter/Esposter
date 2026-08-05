import type { Promisable } from "type-fest";

import { MutationStatus } from "@/models/shared/MutationStatus";
import { getIsAlertedByErrorLink } from "@/services/trpc/errorLink";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";

interface MutationOptions<TResult> extends QueryOptions<TResult> {
  applyOptimistic?: () => Promisable<() => void>;
  // Latest-wins instead of queueing, for a control that fires per keystroke or per drag frame where the
  // Earlier call's value is already replaced on screen by the later one, so losing it costs nothing
  isSupersede?: true;
}

// The four ways a call can end, so a caller can tell a persisted write from one that was dropped as a duplicate,
// Superseded by a newer call, or rejected — the operation's own rejection never escapes, so this is the only
// Signal it did not land. A throwing callback does escape: the promise an entry point returns is rejected by a throw
// From applyOptimistic, from the rollback it returns, or from onSuccess/onError, and nothing here catches them
type MutationOutcome<TResult> =
  | { error: Error; status: MutationStatus.Failed }
  | { result: TResult; status: MutationStatus.Succeeded }
  | { status: MutationStatus.Dropped }
  | { status: MutationStatus.Stale };

interface OperationContext<TResult> {
  applyOptimistic?: () => Promisable<() => void>;
  checkIsStale: () => boolean;
  isSilentWhenStale: boolean;
  onError?: (error: Error) => Promisable<void>;
  onSuccess?: (result: TResult) => Promisable<void>;
}

interface QueryOptions<TResult> {
  // Single-flight per target: while a call with the same key is in flight, a second one issues no request of
  // Its own. A read joins that call and resolves with its outcome, because its caller wanted the data and a
  // Caller handed nothing renders empty beside a populated one. A write is dropped, because its caller wanted
  // The effect and the effect is already on its way
  isExclusive?: true;
  // The identity of the operation's target, always explicit (like a Pinia store id): the entity id or
  // Natural composite for per-entity operations, a stable name for a singleton target,
  // Or a per-call Symbol(description) for independent creates with no natural key
  key: PropertyKey;
  onError?: (error: Error) => Promisable<void>;
  onSuccess?: (result: TResult) => Promisable<void>;
}

export const useMutation = () => {
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  // Which call is the latest for a target. Only supersede-mode operations take a number here — every read,
  // And the writes that opt in; a queued write is the latest for its target by the time it runs
  const callIds = new Map<PropertyKey, number>();
  // The tail of each target's write queue, so two writes to one target run one after the other
  const queues = new Map<PropertyKey, Promise<void>>();
  // The in-flight outcome of each target's exclusive read, so a second caller for data already on its way
  // Awaits that response instead of issuing a duplicate request
  const sharedQueries = new Map<PropertyKey, Promise<MutationOutcome<never>>>();
  const pendingCounts = ref(new Map<PropertyKey, number>());
  const isPending = computed(() => pendingCounts.value.size > 0);
  // Per-key pending for per-item surfaces (a table row's own button), same getter idiom as getRoles(roomId)
  const getIsPending = (key: PropertyKey) => pendingCounts.value.has(key);
  const getCheckIsStale = (key: PropertyKey) => {
    const id = (callIds.get(key) ?? 0) + 1;
    callIds.set(key, id);
    return () => id !== callIds.get(key);
  };
  const claimKey = (key: PropertyKey) => {
    pendingCounts.value.set(key, (pendingCounts.value.get(key) ?? 0) + 1);
  };
  const releaseKey = (key: PropertyKey) => {
    const pendingCount = pendingCounts.value.get(key) ?? 0;
    if (pendingCount <= 1) {
      // No call remains in flight for this key, so its bookkeeping can be dropped wholesale
      pendingCounts.value.delete(key);
      callIds.delete(key);
      queues.delete(key);
    } else pendingCounts.value.set(key, pendingCount - 1);
  };
  // Chains a target's writes so each starts only after the previous settles, which is what makes a write
  // Build on the state the write ahead of it stored. A rejection neither blocks the queue nor leaks to the
  // Calls behind it
  const enqueue = <TResult>(key: PropertyKey, run: () => Promise<TResult>) => {
    const previous = queues.get(key) ?? Promise.resolve();
    let release = noop;
    queues.set(
      key,
      new Promise<void>((resolve) => {
        release = resolve;
      }),
    );
    return withFinalizerAsync(async () => {
      await previous;
      return run();
    }, release);
  };
  const settle = async <TResult>(
    operate: (checkIsStale: () => boolean) => Promise<TResult>,
    { applyOptimistic, checkIsStale, isSilentWhenStale, onError, onSuccess }: OperationContext<TResult>,
  ): Promise<MutationOutcome<TResult>> => {
    const rollback = await applyOptimistic?.();
    return getResultAsync(() => operate(checkIsStale)).match<Promise<MutationOutcome<TResult>>>(
      async (result) => {
        // The target already holds a newer call's value, so applying this older one would undo it
        if (checkIsStale()) return { status: MutationStatus.Stale };

        await onSuccess?.(result);
        return { result, status: MutationStatus.Succeeded };
      },
      async (error) => {
        // A read that lost its race is silent — nothing was applied, so nothing is owed to the user
        if (isSilentWhenStale && checkIsStale()) return { status: MutationStatus.Stale };

        // A write always unwinds and reports, superseded or not: its rollback and its error are the only
        // Record that the value the user is looking at was never persisted
        rollback?.();
        if (onError) await onError(error);
        // The error link already put the codes it owns in front of the user, so alerting the same message here
        // Would stack two identical toasts on every mutation this primitive runs
        else if (!getIsAlertedByErrorLink(error)) createAlert(error.message, "error");
        return { error, status: MutationStatus.Failed };
      },
    );
  };
  // Reads are latest-wins per target: the caller wants the freshest data, and a superseded response has
  // Nothing to unwind — discarding it loses no information
  const executeQuery = <TResult>(
    query: (checkIsStale: () => boolean) => Promise<TResult>,
    { isExclusive, key, onError, onSuccess }: QueryOptions<TResult>,
  ): Promise<MutationOutcome<TResult>> => {
    const sharedQuery = isExclusive ? sharedQueries.get(key) : undefined;
    // The call already in flight applies the state and runs the callbacks for this target, so awaiting it is
    // The whole read — the joiner sees the same data and the same outcome one request later
    if (sharedQuery) return sharedQuery;

    const checkIsStale = getCheckIsStale(key);
    claimKey(key);
    // This read is the latest for the target now, so whatever was joinable is the answer it just superseded —
    // A stale response applies no state and runs no callback, and a later caller joining it would resolve
    // Holding nothing. It issues its own read instead
    sharedQueries.delete(key);
    // The finalizer guarantees pending bookkeeping unwinds even when a callback throws,
    // So a thrown callback can never strand the key as permanently pending
    const outcome = withFinalizerAsync(
      () => settle(query, { checkIsStale, isSilentWhenStale: true, onError, onSuccess }),
      () => {
        releaseKey(key);
        // Only this call's own entry is dropped: the read that superseded it registers its own, and clearing
        // That one would send the next exclusive caller to a duplicate request instead of the call in flight
        if (isExclusive && sharedQueries.get(key) === outcome) sharedQueries.delete(key);
      },
    );
    // The compiler cannot state that a target's entry carries the result type its registrant read — the map is
    // Heterogeneous by key, which is the contract every caller sharing one key already lives under
    if (isExclusive) sharedQueries.set(key, outcome as Promise<MutationOutcome<never>>);
    return outcome;
  };
  // Writes queue per target: discarding one loses its error and its rollback, so it is never dropped by
  // Default — a caller opts into latest-wins with isSupersede where dropping the earlier call is the intent
  const executeMutation = <TResult>(
    mutate: (checkIsStale: () => boolean) => Promise<TResult>,
    { applyOptimistic, isExclusive, isSupersede, key, onError, onSuccess }: MutationOptions<TResult>,
  ): Promise<MutationOutcome<TResult>> => {
    if (isExclusive && pendingCounts.value.has(key)) return Promise.resolve({ status: MutationStatus.Dropped });

    const checkIsStale = isSupersede ? getCheckIsStale(key) : () => false;
    claimKey(key);
    const run = () => settle(mutate, { applyOptimistic, checkIsStale, isSilentWhenStale: false, onError, onSuccess });
    // The finalizer guarantees pending and queue bookkeeping unwind even when applyOptimistic or a callback
    // Throws, so a thrown callback can never strand the key as permanently pending or wedge its queue
    return withFinalizerAsync(
      () => (isSupersede ? run() : enqueue(key, run)),
      () => {
        releaseKey(key);
      },
    );
  };
  return { executeMutation, executeQuery, getIsPending, isPending };
};
