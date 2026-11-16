import type { CacheTag } from "#src/models/cache/CacheTag";
import type { AwaitedReason } from "#src/models/shared/AwaitedReason";
import type { MutationOutcome } from "#src/models/shared/MutationOutcome";
import type { Promisable } from "type-fest";

import { MutationStatus } from "#src/models/shared/MutationStatus";
import { settleOperation } from "#src/services/shared/settleOperation";
import { useCacheStore } from "#src/store/cache";
import { getSynchronizedFunction, withFinalizerAsync } from "@esposter/shared";

// A write that waits for the server's answer before the screen changes names why, from the closed set, and gets the
// Outcome to act on. It may still apply part of its change at once
interface AwaitedMutationOptions<TResult> extends BaseMutationOptions {
  applyOptimistic?: () => Promisable<() => void>;
  awaitedBecause: AwaitedReason;
  onSuccess?: (result: TResult) => Promisable<void>;
}

interface BaseMutationOptions {
  // The cached reads this write makes stale, named by tag so the write never learns which caches exist.
  // Dropped once the write has landed: a rejected or rolled-back write changed nothing, so it invalidates
  // Nothing. Writes only — a read has no reason to invalidate anything, which is why this is not on QueryOptions
  invalidates?: CacheTag[];
  isExclusive?: true;
  isSupersede?: true;
  key: PropertyKey;
  onError?: (error: Error) => Promisable<void>;
}

// A write the screen shows when it is sent. `reconcile` takes what only the server issues, such as a version token the
// Next write reads, and is never where a dialog closes or a row moves
interface OptimisticMutationOptions<TResult> extends BaseMutationOptions {
  applyOptimistic: () => Promisable<() => void>;
  awaitedBecause?: never;
  reconcile?: (result: TResult) => Promisable<void>;
}

interface QueryOptions<TResult> {
  isExclusive?: true;
  key: PropertyKey;
  onError?: (error: Error) => Promisable<void>;
  onSuccess?: (result: TResult) => Promisable<void>;
}

export const useMutation = () => {
  const cacheStore = useCacheStore();
  const { invalidateTags } = cacheStore;
  // Which call is the latest for a target. Only supersede-mode operations take a number here — every read,
  // And the writes that opt in; a queued write is the latest for its target by the time it runs
  const keyCallIdMap = new Map<PropertyKey, number>();
  const keyQueueMap = new Map<PropertyKey, Promise<void>>();
  // The in-flight outcome of each target's exclusive read, so a second caller for data already on its way
  // Awaits that response instead of issuing a duplicate request
  const keySharedQueryMap = new Map<PropertyKey, Promise<MutationOutcome<never>>>();
  const keyPendingCountMap = ref(new Map<PropertyKey, number>());
  const isPending = computed(() => keyPendingCountMap.value.size > 0);
  // Per-key pending for per-item surfaces (a table row's own button)
  const checkIsPending = (key: PropertyKey) => keyPendingCountMap.value.has(key);
  const getCheckIsStale = (key: PropertyKey) => {
    const id = (keyCallIdMap.get(key) ?? 0) + 1;
    keyCallIdMap.set(key, id);
    return () => id !== keyCallIdMap.get(key);
  };
  // Marks whatever is in flight for a target stale without issuing anything of its own: a value that reached
  // The caller from outside this primitive — a subscription push — is newer than a read still on its way, and
  // The read that lands after it must not write the older value back over it. Nothing in flight is nothing to
  // Supersede, which is also what keeps the call-id bookkeeping bounded to the calls that exist
  const supersedeKey = (key: PropertyKey) => {
    if (!keyPendingCountMap.value.has(key)) return;

    getCheckIsStale(key);
    // Whatever was joinable answers for a call this just made stale, so it resolves `Stale` — applying no state
    // And running no callback. A later exclusive caller joining it would resolve holding nothing, so the entry
    // Goes the same way a superseding read's does. The finalizer's identity check is what keeps an older read
    // From dropping the entry a newer one registered after it
    keySharedQueryMap.delete(key);
  };
  const claimKey = (key: PropertyKey) => {
    keyPendingCountMap.value.set(key, (keyPendingCountMap.value.get(key) ?? 0) + 1);
  };
  const releaseKey = (key: PropertyKey) => {
    const pendingCount = keyPendingCountMap.value.get(key) ?? 0;
    if (pendingCount <= 1) {
      // No call remains in flight for this key, so its bookkeeping can be dropped wholesale
      keyPendingCountMap.value.delete(key);
      keyCallIdMap.delete(key);
      keyQueueMap.delete(key);
    } else keyPendingCountMap.value.set(key, pendingCount - 1);
  };
  // Chains a target's writes so each starts only after the previous settles, which is what makes a write
  // Build on the state the write ahead of it stored. A rejection neither blocks the queue nor leaks to the
  // Calls behind it
  const enqueue = <TResult>(key: PropertyKey, run: () => Promise<TResult>) => {
    const previous = keyQueueMap.get(key) ?? Promise.resolve();
    const { promise, resolve: release } = Promise.withResolvers<void>();
    keyQueueMap.set(key, promise);
    return withFinalizerAsync(async () => {
      await previous;
      return run();
    }, release);
  };
  // Resolves once every write already queued for a target has settled. Only a read of what those writes store on the
  // Server needs it, such as an export the server compiles from the saved copy; the screen never waits on it
  const whenSettled = (key: PropertyKey) => keyQueueMap.get(key) ?? Promise.resolve();
  // Reads are latest-wins per target: the caller wants the freshest data, and a superseded response has
  // Nothing to unwind — discarding it loses no information
  const executeQuery = <TResult>(
    query: (checkIsStale: () => boolean) => Promise<TResult>,
    { isExclusive, key, onError, onSuccess }: QueryOptions<TResult>,
  ): Promise<MutationOutcome<TResult>> => {
    const sharedQuery = isExclusive ? keySharedQueryMap.get(key) : undefined;
    // The call already in flight applies the state and runs the callbacks for this target, so awaiting it is
    // The whole read — the joiner sees the same data and the same outcome one request later
    if (sharedQuery) return sharedQuery;

    const checkIsStale = getCheckIsStale(key);
    claimKey(key);
    // This read is the latest for the target now, so whatever was joinable is the answer it just superseded —
    // A stale response applies no state and runs no callback, and a later caller joining it would resolve
    // Holding nothing. It issues its own read instead
    keySharedQueryMap.delete(key);
    const outcome = withFinalizerAsync(
      () => settleOperation(query, { checkIsStale, isSilentWhenStale: true, onError, onSuccess }),
      () => {
        releaseKey(key);
        // Only this call's own entry is dropped: the read that superseded it registers its own, and clearing
        // That one would send the next exclusive caller to a duplicate request instead of the call in flight
        if (isExclusive && keySharedQueryMap.get(key) === outcome) keySharedQueryMap.delete(key);
      },
    );
    // The compiler cannot state that a target's entry carries the result type its registrant read — the map is
    // Heterogeneous by key, which is the contract every caller sharing one key already lives under
    if (isExclusive) keySharedQueryMap.set(key, outcome as Promise<MutationOutcome<never>>);
    return outcome;
  };
  // Writes queue per target: discarding one loses its error and its rollback, so it is never dropped by
  // Default — a caller opts into latest-wins with isSupersede where dropping the earlier call is the intent
  const runMutation = <TResult>(
    mutate: (checkIsStale: () => boolean) => Promise<TResult>,
    {
      applyOptimistic,
      invalidates,
      isExclusive,
      isSupersede,
      key,
      onError,
      onSuccess,
    }: BaseMutationOptions & {
      applyOptimistic?: () => Promisable<() => void>;
      onSuccess?: (result: TResult) => Promisable<void>;
    },
  ): Promise<MutationOutcome<TResult>> => {
    if (isExclusive && keyPendingCountMap.value.has(key)) return Promise.resolve({ status: MutationStatus.Dropped });

    const checkIsStale = isSupersede ? getCheckIsStale(key) : () => false;
    claimKey(key);
    // Composed onto this write's own success callback rather than handled inside settleOperation, which the read path
    // Shares: a read carries no invalidates and so cannot reach this at all. It runs after the write landed
    // And after the caller applied its result, so a cache re-reading here reads the post-write world
    const onSettled = invalidates
      ? async (result: TResult) => {
          await onSuccess?.(result);
          await invalidateTags(invalidates);
        }
      : onSuccess;
    const run = () =>
      settleOperation(mutate, {
        applyOptimistic,
        checkIsStale,
        isSilentWhenStale: false,
        onError,
        onSuccess: onSettled,
      });
    // The finalizer guarantees pending and queue bookkeeping unwind even when applyOptimistic or a callback
    // Throws, so a thrown callback can never strand the key as permanently pending or wedge its queue
    return withFinalizerAsync(
      () => (isSupersede ? run() : enqueue(key, run)),
      () => {
        releaseKey(key);
      },
    );
  };
  // The two forms of a write, the optimistic one last. It hands its caller nothing, so no step the screen takes can
  // Wait on its answer: the write still runs on its key's queue, and whatever the answer brings is the rollback's,
  // The alert's or `reconcile`'s. It floats as a synchronized function, so a test or a shutdown that needs every write
  // Landed drains it with the rest
  function executeMutation<TResult>(
    mutate: (checkIsStale: () => boolean) => Promise<TResult>,
    options: AwaitedMutationOptions<TResult>,
  ): Promise<MutationOutcome<TResult>>;
  function executeMutation<TResult>(
    mutate: (checkIsStale: () => boolean) => Promise<TResult>,
    options: OptimisticMutationOptions<TResult>,
  ): void;
  function executeMutation<TResult>(
    mutate: (checkIsStale: () => boolean) => Promise<TResult>,
    options: AwaitedMutationOptions<TResult> | OptimisticMutationOptions<TResult>,
  ) {
    if (options.awaitedBecause) return runMutation(mutate, options);
    getSynchronizedFunction(() => runMutation(mutate, { ...options, onSuccess: options.reconcile }))();
    return undefined;
  }
  return { checkIsPending, executeMutation, executeQuery, isPending, supersedeKey, whenSettled };
};
