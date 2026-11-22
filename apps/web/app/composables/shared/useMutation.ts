import type { useRunScope } from "#src/composables/shared/useRunScope";
import type { CacheTag } from "#src/models/cache/CacheTag";
import type { AwaitedReason } from "#src/models/shared/AwaitedReason";
import type { MutationOutcome } from "#src/models/shared/MutationOutcome";
import type { TopicRead } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { MutationStatus } from "#src/models/shared/MutationStatus";
import { collectTopics } from "#src/services/realtime/collectTopics";
import { settleOperation } from "#src/services/shared/settleOperation";
import { useCacheStore } from "#src/store/cache";
import { getSynchronizedFunction, noop, withFinalizerAsync } from "@esposter/shared";

// A write that waits for the server's answer before the screen changes names why, from the closed set, and gets the
// Outcome to act on
interface AwaitedMutationOptions<TResult> extends BaseMutationOptions {
  awaitedBecause: AwaitedReason;
  onSuccess?: (result: TResult) => Promisable<void>;
}

// A write nothing on the screen waits for, so its only outcome is `onError`. `reconcile` takes what only the server
// Issues, such as a version token the next write reads, and is never where a dialog closes or a row moves
interface BackgroundMutationOptions<TResult> extends BaseMutationOptions {
  awaitedBecause?: never;
  reconcile?: (result: TResult) => Promisable<void>;
}

interface BaseMutationOptions {
  // The cached reads this write makes stale, named by tag so the write never learns which caches exist.
  // Dropped once the write has landed: a refused write changed nothing, so it invalidates
  // Nothing. Writes only — a read has no reason to invalidate anything, which is why this is not on QueryOptions
  invalidates?: CacheTag[] | undefined;
  isExclusive?: true | undefined;
  key: PropertyKey;
  onError?: ((error: Error) => Promisable<void>) | undefined;
}

interface QueryOptions<TResult> {
  isExclusive?: true | undefined;
  // A one-shot read keeps no watch on its topics: a read whose owner outlives the screen it serves, such as a store's,
  // Would otherwise keep re-reading after the screen is gone. The screen that holds the read live watches it instead
  isUnwatched?: true | undefined;
  key: PropertyKey;
  onError?: ((error: Error) => Promisable<void>) | undefined;
  onSuccess?: (result: TResult) => Promisable<void>;
  // The run scope that orders the read of its key, which every read names, a read with a version included. Its current
  // Run is the only one that commits the answer and the topic watch
  runScope: ReturnType<typeof useRunScope>;
}

export const useMutation = () => {
  const cacheStore = useCacheStore();
  const { invalidateTags } = cacheStore;
  const keyQueueMap = new Map<PropertyKey, Promise<void>>();
  // The in-flight outcome of each target's exclusive read, so a second caller for data already on its way
  // Awaits that response instead of issuing a duplicate request
  const keySharedQueryMap = new Map<PropertyKey, Promise<MutationOutcome<never>>>();
  const keyPendingCountMap = ref(new Map<PropertyKey, number>());
  const isPending = computed(() => keyPendingCountMap.value.size > 0);
  // Per-key pending for per-item surfaces (a table row's own button)
  const checkIsPending = (key: PropertyKey) => keyPendingCountMap.value.has(key);
  const claimKey = (key: PropertyKey) => {
    keyPendingCountMap.value.set(key, (keyPendingCountMap.value.get(key) ?? 0) + 1);
  };
  const releaseKey = (key: PropertyKey) => {
    const pendingCount = keyPendingCountMap.value.get(key) ?? 0;
    if (pendingCount <= 1) {
      // No call remains in flight for this key, so its bookkeeping can be dropped wholesale
      keyPendingCountMap.value.delete(key);
      keyQueueMap.delete(key);
    } else keyPendingCountMap.value.set(key, pendingCount - 1);
  };
  // Chains a target's writes so each starts only after the previous settles, which is what makes a write
  // Build on the state the write ahead of it stored. A rejection neither blocks the queue nor leaks to the
  // Calls behind it. The key is released before the queue is, so a caller awaiting the queue reads it settled
  const enqueue = <TResult>(key: PropertyKey, run: () => Promise<TResult>) => {
    const previous = keyQueueMap.get(key) ?? Promise.resolve();
    const { promise, resolve: release } = Promise.withResolvers<void>();
    keyQueueMap.set(key, promise);
    return withFinalizerAsync(
      async () => {
        await previous;
        return run();
      },
      () => {
        releaseKey(key);
        release();
      },
    );
  };
  // Resolves once every write already queued for a target has settled. Only a read of what those writes store on the
  // Server needs it, such as an export the server compiles from the saved copy; the screen never waits on it
  const whenSettled = (key: PropertyKey) => keyQueueMap.get(key) ?? Promise.resolve();
  // A read stays live: the topics its answer came from are watched for as long as this instance's scope lives, and a
  // Write that changed one runs the same read again — which is why every read of a query procedure goes through here
  const watchTopics = useWatchTopics();
  // Reads are ordered by the run scope the caller holds: a newer read of the key aborts the one before it, and only the
  // Read the scope holds current commits its answer and its topic watch, so an older answer that lands last replaces neither
  // The read is handed its run's signal, so a request it makes is aborted by the newer read that supersedes it
  const executeQuery = <TResult>(
    query: (signal: AbortSignal) => Promise<TResult>,
    options: QueryOptions<TResult>,
  ): Promise<MutationOutcome<TResult>> => {
    const { isExclusive, isUnwatched, key, onError, onSuccess, runScope } = options;
    const sharedQuery = isExclusive ? keySharedQueryMap.get(key) : undefined;
    // The call already in flight applies the state and runs the callbacks for this target, so awaiting it is
    // The whole read — the joiner sees the same data and the same outcome one request later
    if (sharedQuery) return sharedQuery;

    claimKey(key);
    // This read is the newest for the target now, so whatever was joinable is an answer it supersedes: that run commits
    // Nothing, and a later caller joining it would resolve holding nothing. It issues its own read instead
    keySharedQueryMap.delete(key);
    // The outcome of this read once its run commits. A run the scope superseded or aborted commits nothing and is dropped
    let committed: MutationOutcome<TResult> = { status: MutationStatus.Dropped };
    const commit = async ({ reads, result }: { reads: TopicRead[]; result: TResult }) => {
      committed = { result, status: MutationStatus.Succeeded };
      await onSuccess?.(result);
      watchTopics(
        key,
        isUnwatched ? undefined : reads,
        getSynchronizedFunction(() => executeQuery(query, options)),
      );
    };
    const outcome = withFinalizerAsync(
      async () => {
        const settled = await settleOperation(
          async () => {
            await runScope.run((signal) => collectTopics(() => query(signal)), commit, noop, key);
          },
          { onError },
        );
        return settled.status === MutationStatus.Failed ? settled : committed;
      },
      () => {
        releaseKey(key);
        // Only this call's own entry is dropped: the read that superseded it registers its own, and clearing
        // That one would send the next exclusive caller to a duplicate request instead of the call in flight
        if (isExclusive && keySharedQueryMap.get(key) === outcome) keySharedQueryMap.delete(key);
      },
    );
    // The compiler cannot state that a target's entry carries the result type its registrant read — the map is
    // Heterogeneous by key, which is the contract every caller sharing one key already lives under
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The shared query map is keyed by target and holds each caller's result type, which no single map type states
    if (isExclusive) keySharedQueryMap.set(key, outcome as Promise<MutationOutcome<never>>);
    return outcome;
  };
  // Writes queue per target: discarding one loses its error, so it is never dropped by default
  const runMutation = <TResult>(
    mutate: () => Promise<TResult>,
    {
      invalidates,
      isExclusive,
      key,
      onError,
      onSuccess,
    }: BaseMutationOptions & { onSuccess?: ((result: TResult) => Promisable<void>) | undefined },
  ): Promise<MutationOutcome<TResult>> => {
    if (isExclusive && keyPendingCountMap.value.has(key)) return Promise.resolve({ status: MutationStatus.Dropped });

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
    const run = () => settleOperation(mutate, { onError, onSuccess: onSettled });
    // The finalizer guarantees pending and queue bookkeeping unwind even when a callback
    // Throws, so a thrown callback can never strand the key as permanently pending or wedge its queue
    return enqueue(key, run);
  };
  // The awaited form, whose outcome its caller acts on once the write has landed
  const executeMutation = <TResult>(
    mutate: () => Promise<TResult>,
    options: AwaitedMutationOptions<TResult>,
  ): Promise<MutationOutcome<TResult>> => runMutation(mutate, options);
  // The background form, last. It hands its caller nothing, so no step the screen takes can wait on its answer: the
  // Write still runs on its key's queue, and whatever the answer brings is the alert's or `reconcile`'s. It floats as a
  // Synchronized function, so a test or a shutdown that needs every write landed drains it with the rest
  const executeBackgroundMutation = <TResult>(
    mutate: () => Promise<TResult>,
    options: BackgroundMutationOptions<TResult>,
  ): void => {
    getSynchronizedFunction(() => runMutation(mutate, { ...options, onSuccess: options.reconcile }))();
  };
  return { checkIsPending, executeBackgroundMutation, executeMutation, executeQuery, isPending, whenSettled };
};
