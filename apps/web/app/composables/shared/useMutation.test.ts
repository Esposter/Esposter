// @vitest-environment nuxt
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { MutationStatus } from "#src/models/shared/MutationStatus";
import { readActiveTopicReads } from "#src/services/realtime/collectTopics";
import { getLastOpenRealtimeSocketCall } from "#src/services/realtime/openRealtimeSocket.test";
import { useAlertStore } from "#src/store/alert";
import { useConnectionStore } from "#src/store/realtime/connection";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { noop, waitForSynchronizedFunctions } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { assert, describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

// A run scope held by one test, so each read orders only within that test
const createRunScope = () => {
  const runScope = effectScope().run(useRunScope);
  assert.exists(runScope);
  return runScope;
};

describe(useMutation, () => {
  const key = "";
  const otherKey = " ";
  const result = "result";
  const error = new Error(" ");

  test("applies optimistically and keeps the change on success", async () => {
    expect.hasAssertions();

    const rollback = vi.fn<() => void>();
    const applyOptimistic = vi.fn<() => () => void>(() => rollback);
    const { executeMutation } = useMutation();
    executeMutation(() => Promise.resolve(), { applyOptimistic, key });
    await flushPromises();

    expect(applyOptimistic).toHaveBeenCalledExactlyOnceWith();
    expect(rollback).not.toHaveBeenCalled();
  });

  test("passes the resolved result to onSuccess", async () => {
    expect.hasAssertions();

    const onSuccess = vi.fn<(result: string) => void>();
    const { executeMutation } = useMutation();
    await executeMutation(() => Promise.resolve(result), {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key,
      onSuccess,
    });

    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(result);
  });

  test("reconcile receives the server's result once the write lands", async () => {
    expect.hasAssertions();

    const reconcile = vi.fn<(result: string) => void>();
    const { promise: mutatePromise, resolve: resolveMutate } = Promise.withResolvers<string>();
    const { executeMutation } = useMutation();
    executeMutation(() => mutatePromise, { applyOptimistic: () => noop, key, reconcile });
    await flushPromises();
    expect(reconcile).not.toHaveBeenCalled();

    resolveMutate(result);
    await flushPromises();

    expect(reconcile).toHaveBeenCalledExactlyOnceWith(result);
  });

  test("rolls back and alerts on failure", async () => {
    expect.hasAssertions();

    const rollback = vi.fn<() => void>();
    const applyOptimistic = vi.fn<() => () => void>(() => rollback);
    const { executeMutation } = useMutation();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    executeMutation(() => Promise.reject(error), { applyOptimistic, key });
    await flushPromises();

    expect(rollback).toHaveBeenCalledExactlyOnceWith();
    expect(alerts.value).toHaveLength(1);
  });

  test("routes failure to onError instead of the default alert", async () => {
    expect.hasAssertions();

    const onError = vi.fn<(error: Error) => void>();
    const { executeMutation } = useMutation();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    executeMutation(() => Promise.reject(error), { applyOptimistic: () => noop, key, onError });
    await flushPromises();

    expect(onError).toHaveBeenCalledExactlyOnceWith(error);
    expect(alerts.value).toHaveLength(0);
  });

  test("queues writes to one target so each starts only after the one ahead of it settles", async () => {
    expect.hasAssertions();

    const startOrder: string[] = [];
    const { executeMutation } = useMutation();
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    executeMutation(
      () => {
        startOrder.push("first");
        return firstPromise;
      },
      { applyOptimistic: () => noop, key },
    );
    executeMutation(
      () => {
        startOrder.push("second");
        return Promise.resolve();
      },
      { applyOptimistic: () => noop, key },
    );
    await flushPromises();
    const startOrderWhileFirstInFlight = [...startOrder];
    resolveFirst();
    await flushPromises();

    expect(startOrderWhileFirstInFlight).toStrictEqual(["first"]);
    expect(startOrder).toStrictEqual(["first", "second"]);
  });

  test("runs every queued write's onSuccess rather than dropping the earlier one", async () => {
    expect.hasAssertions();

    const firstOnSuccess = vi.fn<() => void>();
    const secondOnSuccess = vi.fn<() => void>();
    const { executeMutation } = useMutation();
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    const first = executeMutation(() => firstPromise, {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key,
      onSuccess: firstOnSuccess,
    });
    const second = executeMutation(() => Promise.resolve(), {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key,
      onSuccess: secondOnSuccess,
    });
    await flushPromises();
    resolveFirst();
    await Promise.all([first, second]);

    expect(firstOnSuccess).toHaveBeenCalledTimes(1);
    expect(secondOnSuccess).toHaveBeenCalledTimes(1);
  });

  test("rolls back and alerts a queued write that fails behind another", async () => {
    expect.hasAssertions();

    const rollback = vi.fn<() => void>();
    const { executeMutation } = useMutation();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    executeMutation(() => firstPromise, { applyOptimistic: () => noop, key });
    executeMutation(() => Promise.reject(error), { applyOptimistic: () => rollback, key });
    await flushPromises();
    resolveFirst();
    await flushPromises();

    expect(rollback).toHaveBeenCalledExactlyOnceWith();
    expect(alerts.value).toHaveLength(1);
  });

  test("runs the next queued write once the one ahead of it fails", async () => {
    expect.hasAssertions();

    const mutate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const { executeMutation } = useMutation();
    const { promise: firstPromise, reject: rejectFirst } = Promise.withResolvers<void>();
    executeMutation(() => firstPromise, { applyOptimistic: () => noop, key, onError: noop });
    executeMutation(mutate, { applyOptimistic: () => noop, key });
    await flushPromises();
    expect(mutate).not.toHaveBeenCalled();
    rejectFirst(error);
    await flushPromises();

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  test("runs writes to different targets concurrently", async () => {
    expect.hasAssertions();

    const startOrder: string[] = [];
    const { executeMutation } = useMutation();
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    executeMutation(
      () => {
        startOrder.push("first");
        return firstPromise;
      },
      { applyOptimistic: () => noop, key },
    );
    executeMutation(
      () => {
        startOrder.push("second");
        return Promise.resolve();
      },
      { applyOptimistic: () => noop, key: otherKey },
    );
    await flushPromises();
    const startOrderWhileFirstInFlight = [...startOrder];
    resolveFirst();
    await flushPromises();

    expect(startOrderWhileFirstInFlight).toStrictEqual(["first", "second"]);
  });

  test("shares one in-flight exclusive read with the caller that joined it", async () => {
    expect.hasAssertions();

    const onSuccess = vi.fn<(result: string) => void>();
    const joinedOnSuccess = vi.fn<(result: string) => void>();
    const query = vi.fn<() => Promise<string>>();
    const { executeQuery } = useMutation();
    const runScope = createRunScope();
    const { promise: queryPromise, resolve: resolveQuery } = Promise.withResolvers<string>();
    query.mockReturnValueOnce(queryPromise);
    const inFlightRead = executeQuery(query, { isExclusive: true, key, onSuccess, runScope });
    const joinedRead = executeQuery(query, { isExclusive: true, key, onSuccess: joinedOnSuccess, runScope });
    await flushPromises();
    resolveQuery(result);

    await expect(joinedRead).resolves.toStrictEqual({ result, status: MutationStatus.Succeeded });
    await expect(inFlightRead).resolves.toStrictEqual({ result, status: MutationStatus.Succeeded });
    expect(query).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith(result);
    expect(joinedOnSuccess).not.toHaveBeenCalled();
  });

  test("reports an exclusive read's failure to the caller that joined it", async () => {
    expect.hasAssertions();

    const { executeQuery } = useMutation();
    const runScope = createRunScope();
    const { promise: queryPromise, reject: rejectQuery } = Promise.withResolvers<void>();
    const inFlightRead = executeQuery(() => queryPromise, { isExclusive: true, key, onError: noop, runScope });
    const joinedRead = executeQuery(() => Promise.resolve(), { isExclusive: true, key, onError: noop, runScope });
    await flushPromises();
    rejectQuery(error);

    await expect(joinedRead).resolves.toStrictEqual({ error, status: MutationStatus.Failed });
    await expect(inFlightRead).resolves.toStrictEqual({ error, status: MutationStatus.Failed });
  });

  test("issues its own exclusive read rather than joining one a later read superseded", async () => {
    expect.hasAssertions();

    const onSuccess = vi.fn<(result: string) => void>();
    const { executeQuery } = useMutation();
    const runScope = createRunScope();
    const { promise: exclusivePromise, resolve: resolveExclusive } = Promise.withResolvers<string>();
    const exclusiveRead = executeQuery(() => exclusivePromise, { isExclusive: true, key, onSuccess, runScope });
    await executeQuery(() => Promise.resolve("replacement"), { key, onSuccess, runScope });
    const joinedRead = executeQuery(() => Promise.resolve("joined"), { isExclusive: true, key, onSuccess, runScope });
    resolveExclusive("exclusive");

    await expect(joinedRead).resolves.toStrictEqual({ result: "joined", status: MutationStatus.Succeeded });
    await expect(exclusiveRead).resolves.toStrictEqual({ status: MutationStatus.Dropped });
    expect(onSuccess.mock.calls).toStrictEqual([["replacement"], ["joined"]]);
  });

  test("leaves a newer exclusive read joinable once the one it superseded settles", async () => {
    expect.hasAssertions();

    const duplicateQuery = vi.fn<() => Promise<string>>(() => Promise.resolve("duplicate"));
    const { executeQuery } = useMutation();
    const runScope = createRunScope();
    const { promise: supersededQueryPromise, resolve: resolveSupersededQuery } = Promise.withResolvers<string>();
    const { promise: newerQueryPromise, resolve: resolveNewerQuery } = Promise.withResolvers<string>();
    const supersededRead = executeQuery(() => supersededQueryPromise, { isExclusive: true, key, runScope });
    await executeQuery(() => Promise.resolve("replacement"), { key, runScope });
    const newerRead = executeQuery(() => newerQueryPromise, { isExclusive: true, key, runScope });
    await flushPromises();
    resolveSupersededQuery("superseded");
    await supersededRead;
    const joinedRead = executeQuery(duplicateQuery, { isExclusive: true, key, runScope });
    resolveNewerQuery("newer");

    await expect(joinedRead).resolves.toStrictEqual({ result: "newer", status: MutationStatus.Succeeded });
    await expect(newerRead).resolves.toStrictEqual({ result: "newer", status: MutationStatus.Succeeded });
    expect(duplicateQuery).not.toHaveBeenCalled();
  });

  test("issues a fresh exclusive read once the one it would have joined has settled", async () => {
    expect.hasAssertions();

    const query = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const { executeQuery } = useMutation();
    const runScope = createRunScope();
    await executeQuery(query, { isExclusive: true, key, runScope });
    await executeQuery(query, { isExclusive: true, key, runScope });

    expect(query).toHaveBeenCalledTimes(2);
  });

  test("alerts a read that fails", async () => {
    expect.hasAssertions();

    const { executeQuery } = useMutation();
    const runScope = createRunScope();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const outcome = await executeQuery(() => Promise.reject(error), { key, runScope });

    expect(outcome.status).toBe(MutationStatus.Failed);
    expect(alerts.value).toHaveLength(1);
  });

  test("tracks pending state across a call's lifecycle, scoped to its key while isPending aggregates", async () => {
    expect.hasAssertions();

    const { checkIsPending, executeMutation, isPending } = useMutation();
    const { promise: mutatePromise, resolve: resolveMutate } = Promise.withResolvers<void>();
    executeMutation(() => mutatePromise, { applyOptimistic: () => noop, key });
    const isPendingWhileInFlight = isPending.value;
    const isKeyPendingWhileInFlight = checkIsPending(key);
    const isOtherKeyPendingWhileInFlight = checkIsPending(otherKey);
    await flushPromises();
    resolveMutate();
    await flushPromises();

    expect(isPendingWhileInFlight).toBe(true);
    expect(isKeyPendingWhileInFlight).toBe(true);
    expect(isOtherKeyPendingWhileInFlight).toBe(false);
    expect(isPending.value).toBe(false);
    expect(checkIsPending(key)).toBe(false);
  });

  test("clears pending state when onSuccess throws", async () => {
    expect.hasAssertions();

    const { checkIsPending, executeMutation, isPending } = useMutation();

    await expect(
      executeMutation(() => Promise.resolve(), {
        awaitedBecause: AwaitedReason.ServerIssuedValue,
        key,
        onSuccess: () => {
          throw error;
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(checkIsPending(key)).toBe(false);
    expect(isPending.value).toBe(false);
  });

  test("clears pending state when onError throws", async () => {
    expect.hasAssertions();

    const { checkIsPending, executeMutation, isPending } = useMutation();

    await expect(
      executeMutation(() => Promise.reject(error), {
        awaitedBecause: AwaitedReason.ServerIssuedValue,
        key,
        onError: () => {
          throw error;
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(checkIsPending(key)).toBe(false);
    expect(isPending.value).toBe(false);
  });

  test("clears pending state when applyOptimistic throws", async () => {
    expect.hasAssertions();

    const { checkIsPending, executeMutation, isPending } = useMutation();

    await expect(
      executeMutation(() => Promise.resolve(), {
        applyOptimistic: () => {
          throw error;
        },
        awaitedBecause: AwaitedReason.ServerIssuedValue,
        key,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(isPending.value).toBe(false);
    expect(checkIsPending(key)).toBe(false);
  });

  test("keeps a target's queue running after a write throws from a callback", async () => {
    expect.hasAssertions();

    const mutate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const { executeMutation } = useMutation();

    await expect(
      executeMutation(() => Promise.resolve(), {
        awaitedBecause: AwaitedReason.ServerIssuedValue,
        key,
        onSuccess: () => {
          throw error;
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
    executeMutation(mutate, { applyOptimistic: () => noop, key });
    await flushPromises();

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  test("reports the persisted result on success", async () => {
    expect.hasAssertions();

    const { executeMutation } = useMutation();
    const outcome = await executeMutation(() => Promise.resolve(result), {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key,
    });

    expect(outcome).toStrictEqual({ result, status: MutationStatus.Succeeded });
  });

  test("reports the error on failure rather than throwing it", async () => {
    expect.hasAssertions();

    const { executeMutation } = useMutation();
    const outcome = await executeMutation(() => Promise.reject(error), {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key,
      onError: noop,
    });

    expect(outcome).toStrictEqual({ error, status: MutationStatus.Failed });
  });

  test("drops a concurrent exclusive call with the same key, reporting it as distinct from success", async () => {
    expect.hasAssertions();

    const { executeMutation } = useMutation();
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    const mutate = vi.fn<() => Promise<void>>();
    mutate.mockReturnValueOnce(firstPromise);
    executeMutation(mutate, { applyOptimistic: () => noop, isExclusive: true, key });
    await flushPromises();
    const outcome = await executeMutation(mutate, {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      isExclusive: true,
      key,
    });
    resolveFirst();
    await flushPromises();

    expect(outcome).toStrictEqual({ status: MutationStatus.Dropped });
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  // A read of what a write stored, such as an export the server compiles from the saved copy, awaits the queue and then
  // Reads the write's outcome, so the key must read as settled by the time the queue resolves
  test("a target's writes have settled once its queue resolves", async () => {
    expect.hasAssertions();

    const { checkIsPending, executeMutation, whenSettled } = useMutation();
    executeMutation(() => Promise.resolve(), { applyOptimistic: () => noop, key });
    await whenSettled(key);

    expect(checkIsPending(key)).toBe(false);
  });

  test("runs onSuccess for overlapping calls with different keys", async () => {
    expect.hasAssertions();

    const firstOnSuccess = vi.fn<() => void>();
    const secondOnSuccess = vi.fn<() => void>();
    const { executeMutation } = useMutation();
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    const first = executeMutation(() => firstPromise, {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key,
      onSuccess: firstOnSuccess,
    });
    await executeMutation(() => Promise.resolve(), {
      awaitedBecause: AwaitedReason.ServerIssuedValue,
      key: otherKey,
      onSuccess: secondOnSuccess,
    });
    resolveFirst();
    await first;

    expect(firstOnSuccess).toHaveBeenCalledTimes(1);
    expect(secondOnSuccess).toHaveBeenCalledTimes(1);
  });

  // A one-shot read takes no watch, so a change to the topics it named reads nothing: the screen that keeps the row live owns that
  test("takes no topic watch for a read marked unwatched", async () => {
    expect.hasAssertions();

    const connectionStore = useConnectionStore();
    connectionStore.openUser();
    const [, onFrame] = getLastOpenRealtimeSocketCall();
    const topic = getTopic(TopicKind.Post, v7());
    const query = vi.fn<() => Promise<string>>(() => {
      readActiveTopicReads()?.push({ readAt: 0, signature: "", topics: [{ topic }] });
      return Promise.resolve(result);
    });
    const scope = effectScope();
    const { executeQuery } = scope.run(() => useMutation()) ?? {};
    const runScope = createRunScope();
    await executeQuery?.(query, { isUnwatched: true, key, runScope });
    onFrame?.(JSON.stringify({ data: { topic }, type: "invalidate" }));
    await waitForSynchronizedFunctions();
    scope.stop();

    expect(query).toHaveBeenCalledTimes(1);
  });
});
