// @vitest-environment nuxt
import { MutationStatus } from "@/models/shared/MutationStatus";
import { useAlertStore } from "@/store/alert";
import { noop } from "@esposter/shared";
import { flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useMutation, () => {
  const key = "";
  const otherKey = " ";

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("applies optimistically and keeps the change on success", async () => {
    expect.hasAssertions();

    const rollback = vi.fn<() => void>();
    const applyOptimistic = vi.fn<() => () => void>(() => rollback);
    const { executeMutation } = useMutation();
    await executeMutation(() => Promise.resolve(), { applyOptimistic, key });

    expect(applyOptimistic).toHaveBeenCalledTimes(1);
    expect(rollback).not.toHaveBeenCalled();
  });

  test("passes the resolved result to onSuccess", async () => {
    expect.hasAssertions();

    const onSuccess = vi.fn<(result: string) => void>();
    const { executeMutation } = useMutation();
    await executeMutation(() => Promise.resolve("result"), { key, onSuccess });

    expect(onSuccess).toHaveBeenCalledExactlyOnceWith("result");
  });

  test("rolls back and alerts on failure", async () => {
    expect.hasAssertions();

    const rollback = vi.fn<() => void>();
    const applyOptimistic = vi.fn<() => () => void>(() => rollback);
    const { executeMutation } = useMutation();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await executeMutation(() => Promise.reject(new Error("error")), { applyOptimistic, key });

    expect(rollback).toHaveBeenCalledTimes(1);
    expect(alerts.value).toHaveLength(1);
  });

  test("routes failure to onError instead of the default alert", async () => {
    expect.hasAssertions();

    const onError = vi.fn<(error: Error) => void>();
    const { executeMutation } = useMutation();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const error = new Error("error");
    await executeMutation(() => Promise.reject(error), { key, onError });

    expect(onError).toHaveBeenCalledExactlyOnceWith(error);
    expect(alerts.value).toHaveLength(0);
  });

  test("queues writes to one target so each starts only after the one ahead of it settles", async () => {
    expect.hasAssertions();

    const startOrder: string[] = [];
    const { executeMutation } = useMutation();
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    const first = executeMutation(
      () => {
        startOrder.push("first");
        return firstPromise;
      },
      { key },
    );
    const second = executeMutation(
      () => {
        startOrder.push("second");
        return Promise.resolve();
      },
      { key },
    );
    await flushPromises();
    const startOrderWhileFirstInFlight = [...startOrder];
    resolveFirst();
    await Promise.all([first, second]);

    expect(startOrderWhileFirstInFlight).toStrictEqual(["first"]);
    expect(startOrder).toStrictEqual(["first", "second"]);
  });

  test("runs every queued write's onSuccess rather than dropping the earlier one", async () => {
    expect.hasAssertions();

    const firstOnSuccess = vi.fn<() => void>();
    const secondOnSuccess = vi.fn<() => void>();
    const { executeMutation } = useMutation();
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    const first = executeMutation(() => firstPromise, { key, onSuccess: firstOnSuccess });
    const second = executeMutation(() => Promise.resolve(), { key, onSuccess: secondOnSuccess });
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
    const first = executeMutation(() => firstPromise, { key });
    const second = executeMutation(() => Promise.reject(new Error("error")), {
      applyOptimistic: () => rollback,
      key,
    });
    await flushPromises();
    resolveFirst();
    await Promise.all([first, second]);

    expect(rollback).toHaveBeenCalledTimes(1);
    expect(alerts.value).toHaveLength(1);
  });

  test("runs the next queued write once the one ahead of it fails", async () => {
    expect.hasAssertions();

    const mutate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const { executeMutation } = useMutation();
    const { promise: firstPromise, reject: rejectFirst } = Promise.withResolvers<void>();
    const first = executeMutation(() => firstPromise, { key, onError: noop });
    const second = executeMutation(mutate, { key });
    await flushPromises();
    const isSecondStartedWhileFirstInFlight = mutate.mock.calls.length > 0;
    rejectFirst(new Error("error"));
    await Promise.all([first, second]);

    expect(isSecondStartedWhileFirstInFlight).toBe(false);
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  test("runs writes to different targets concurrently", async () => {
    expect.hasAssertions();

    const startOrder: string[] = [];
    const { executeMutation } = useMutation();
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    const first = executeMutation(
      () => {
        startOrder.push("first");
        return firstPromise;
      },
      { key },
    );
    const second = executeMutation(
      () => {
        startOrder.push("second");
        return Promise.resolve();
      },
      { key: otherKey },
    );
    await flushPromises();
    const startOrderWhileFirstInFlight = [...startOrder];
    resolveFirst();
    await Promise.all([first, second]);

    expect(startOrderWhileFirstInFlight).toStrictEqual(["first", "second"]);
  });

  test("rolls back and alerts a superseded write that fails", async () => {
    expect.hasAssertions();

    const rollback = vi.fn<() => void>();
    const { executeMutation } = useMutation();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { promise: supersededPromise, reject: rejectSuperseded } = Promise.withResolvers<void>();
    const supersededWrite = executeMutation(() => supersededPromise, {
      applyOptimistic: () => rollback,
      isSupersede: true,
      key,
    });
    await executeMutation(() => Promise.resolve(), { isSupersede: true, key });
    rejectSuperseded(new Error("error"));
    await supersededWrite;

    expect(rollback).toHaveBeenCalledTimes(1);
    expect(alerts.value).toHaveLength(1);
  });

  test("reports a superseded write as stale rather than succeeded", async () => {
    expect.hasAssertions();

    const { executeMutation } = useMutation();
    const { promise: supersededPromise, resolve: resolveSuperseded } = Promise.withResolvers<void>();
    const supersededWrite = executeMutation(() => supersededPromise, { isSupersede: true, key });
    await executeMutation(() => Promise.resolve(), { isSupersede: true, key });
    resolveSuperseded();

    await expect(supersededWrite).resolves.toStrictEqual({ status: MutationStatus.Stale });
  });

  test("drops the superseded onSuccess for overlapping supersede writes with the same key", async () => {
    expect.hasAssertions();

    const supersededOnSuccess = vi.fn<() => void>();
    const freshOnSuccess = vi.fn<() => void>();
    const { executeMutation } = useMutation();
    const { promise: supersededPromise, resolve: resolveSuperseded } = Promise.withResolvers<void>();
    const supersededWrite = executeMutation(() => supersededPromise, {
      isSupersede: true,
      key,
      onSuccess: supersededOnSuccess,
    });
    await executeMutation(() => Promise.resolve(), { isSupersede: true, key, onSuccess: freshOnSuccess });
    resolveSuperseded();
    await supersededWrite;

    expect(supersededOnSuccess).not.toHaveBeenCalled();
    expect(freshOnSuccess).toHaveBeenCalledTimes(1);
  });

  test("runs reads for one target concurrently and keeps only the latest", async () => {
    expect.hasAssertions();

    const supersededOnSuccess = vi.fn<() => void>();
    const freshOnSuccess = vi.fn<() => void>();
    const { executeQuery } = useMutation();
    const { promise: supersededPromise, resolve: resolveSuperseded } = Promise.withResolvers<void>();
    const supersededRead = executeQuery(() => supersededPromise, { key, onSuccess: supersededOnSuccess });
    await executeQuery(() => Promise.resolve(), { key, onSuccess: freshOnSuccess });
    resolveSuperseded();

    await expect(supersededRead).resolves.toStrictEqual({ status: MutationStatus.Stale });
    expect(supersededOnSuccess).not.toHaveBeenCalled();
    expect(freshOnSuccess).toHaveBeenCalledTimes(1);
  });

  test("drops a superseded read's failure without alerting", async () => {
    expect.hasAssertions();

    const { executeQuery } = useMutation();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { promise: supersededPromise, reject: rejectSuperseded } = Promise.withResolvers<void>();
    const supersededRead = executeQuery(() => supersededPromise, { key });
    await executeQuery(() => Promise.resolve(), { key });
    rejectSuperseded(new Error("error"));

    await expect(supersededRead).resolves.toStrictEqual({ status: MutationStatus.Stale });
    expect(alerts.value).toHaveLength(0);
  });

  test("shares one in-flight exclusive read with the caller that joined it", async () => {
    expect.hasAssertions();

    const onSuccess = vi.fn<(result: string) => void>();
    const joinedOnSuccess = vi.fn<(result: string) => void>();
    const query = vi.fn<() => Promise<string>>();
    const { executeQuery } = useMutation();
    const { promise: queryPromise, resolve: resolveQuery } = Promise.withResolvers<string>();
    query.mockReturnValueOnce(queryPromise);
    const inFlightRead = executeQuery(query, { isExclusive: true, key, onSuccess });
    const joinedRead = executeQuery(query, { isExclusive: true, key, onSuccess: joinedOnSuccess });
    await flushPromises();
    resolveQuery("result");

    await expect(joinedRead).resolves.toStrictEqual({ result: "result", status: MutationStatus.Succeeded });
    await expect(inFlightRead).resolves.toStrictEqual({ result: "result", status: MutationStatus.Succeeded });
    expect(query).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledExactlyOnceWith("result");
    expect(joinedOnSuccess).not.toHaveBeenCalled();
  });

  test("reports an exclusive read's failure to the caller that joined it", async () => {
    expect.hasAssertions();

    const { executeQuery } = useMutation();
    const error = new Error("error");
    const { promise: queryPromise, reject: rejectQuery } = Promise.withResolvers<void>();
    const inFlightRead = executeQuery(() => queryPromise, { isExclusive: true, key, onError: noop });
    const joinedRead = executeQuery(() => Promise.resolve(), { isExclusive: true, key, onError: noop });
    await flushPromises();
    rejectQuery(error);

    await expect(joinedRead).resolves.toStrictEqual({ error, status: MutationStatus.Failed });
    await expect(inFlightRead).resolves.toStrictEqual({ error, status: MutationStatus.Failed });
  });

  // The superseded read applies no state and runs no callback, so a caller that joined it would resolve holding
  // Nothing — an empty list beside a populated one, which is the outcome isExclusive exists to prevent
  test("issues its own exclusive read rather than joining one a later read superseded", async () => {
    expect.hasAssertions();

    const onSuccess = vi.fn<(result: string) => void>();
    const { executeQuery } = useMutation();
    const { promise: exclusivePromise, resolve: resolveExclusive } = Promise.withResolvers<string>();
    const exclusiveRead = executeQuery(() => exclusivePromise, { isExclusive: true, key, onSuccess });
    await executeQuery(() => Promise.resolve("replacement"), { key, onSuccess });
    const joinedRead = executeQuery(() => Promise.resolve("joined"), { isExclusive: true, key, onSuccess });
    resolveExclusive("exclusive");

    await expect(joinedRead).resolves.toStrictEqual({ result: "joined", status: MutationStatus.Succeeded });
    await expect(exclusiveRead).resolves.toStrictEqual({ status: MutationStatus.Stale });
    expect(onSuccess.mock.calls).toStrictEqual([["replacement"], ["joined"]]);
  });

  // A superseded read's cleanup owns only the entry it registered itself — dropping the one a later exclusive
  // Read put there sends the next caller to a duplicate request instead of the call already in flight
  test("leaves a newer exclusive read joinable once the one it superseded settles", async () => {
    expect.hasAssertions();

    const duplicateQuery = vi.fn<() => Promise<string>>(() => Promise.resolve("duplicate"));
    const { executeQuery } = useMutation();
    const { promise: supersededQueryPromise, resolve: resolveSupersededQuery } = Promise.withResolvers<string>();
    const { promise: newerQueryPromise, resolve: resolveNewerQuery } = Promise.withResolvers<string>();
    const supersededRead = executeQuery(() => supersededQueryPromise, { isExclusive: true, key });
    await executeQuery(() => Promise.resolve("replacement"), { key });
    const newerRead = executeQuery(() => newerQueryPromise, { isExclusive: true, key });
    await flushPromises();
    resolveSupersededQuery("superseded");
    await supersededRead;
    const joinedRead = executeQuery(duplicateQuery, { isExclusive: true, key });
    resolveNewerQuery("newer");

    await expect(joinedRead).resolves.toStrictEqual({ result: "newer", status: MutationStatus.Succeeded });
    await expect(newerRead).resolves.toStrictEqual({ result: "newer", status: MutationStatus.Succeeded });
    expect(duplicateQuery).not.toHaveBeenCalled();
  });

  test("issues a fresh exclusive read once the one it would have joined has settled", async () => {
    expect.hasAssertions();

    const query = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const { executeQuery } = useMutation();
    await executeQuery(query, { isExclusive: true, key });
    await executeQuery(query, { isExclusive: true, key });

    expect(query).toHaveBeenCalledTimes(2);
  });

  test("alerts a read that fails while it is still the latest", async () => {
    expect.hasAssertions();

    const { executeQuery } = useMutation();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const outcome = await executeQuery(() => Promise.reject(new Error("error")), { key });

    expect(outcome.status).toBe(MutationStatus.Failed);
    expect(alerts.value).toHaveLength(1);
  });

  test("tracks pending state across a call's lifecycle", async () => {
    expect.hasAssertions();

    const { executeMutation, isPending } = useMutation();
    const { promise: mutatePromise, resolve: resolveMutate } = Promise.withResolvers<void>();
    const pendingWrite = executeMutation(() => mutatePromise, { key });
    const isPendingWhileInFlight = isPending.value;
    await flushPromises();
    resolveMutate();
    await pendingWrite;

    expect(isPendingWhileInFlight).toBe(true);
    expect(isPending.value).toBe(false);
  });

  test("scopes checkIsPending to its key while isPending aggregates", async () => {
    expect.hasAssertions();

    const { checkIsPending, executeMutation, isPending } = useMutation();
    const { promise: mutatePromise, resolve: resolveMutate } = Promise.withResolvers<void>();
    const pendingWrite = executeMutation(() => mutatePromise, { key });
    const isKeyPendingWhileInFlight = checkIsPending(key);
    const isOtherKeyPendingWhileInFlight = checkIsPending(otherKey);
    await flushPromises();
    resolveMutate();
    await pendingWrite;

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
        key,
        onSuccess: () => {
          throw new Error("error");
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: error]`);

    expect(checkIsPending(key)).toBe(false);
    expect(isPending.value).toBe(false);
  });

  test("clears pending state when onError throws", async () => {
    expect.hasAssertions();

    const { checkIsPending, executeMutation, isPending } = useMutation();

    await expect(
      executeMutation(() => Promise.reject(new Error("error")), {
        key,
        onError: () => {
          throw new Error(" ");
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
          throw new Error("error");
        },
        key,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: error]`);

    expect(isPending.value).toBe(false);
    expect(checkIsPending(key)).toBe(false);
  });

  test("keeps a target's queue running after a write throws from a callback", async () => {
    expect.hasAssertions();

    const mutate = vi.fn<() => Promise<void>>(() => Promise.resolve());
    const { executeMutation } = useMutation();

    await expect(
      executeMutation(() => Promise.resolve(), {
        key,
        onSuccess: () => {
          throw new Error("error");
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: error]`);
    await executeMutation(mutate, { key });

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  test("reports the persisted result on success", async () => {
    expect.hasAssertions();

    const { executeMutation } = useMutation();
    const outcome = await executeMutation(() => Promise.resolve("result"), { key });

    expect(outcome).toStrictEqual({ result: "result", status: MutationStatus.Succeeded });
  });

  test("reports the error on failure rather than throwing it", async () => {
    expect.hasAssertions();

    const { executeMutation } = useMutation();
    const error = new Error("error");
    const outcome = await executeMutation(() => Promise.reject(error), { key, onError: noop });

    expect(outcome).toStrictEqual({ error, status: MutationStatus.Failed });
  });

  test("reports a dropped exclusive call as distinct from success", async () => {
    expect.hasAssertions();

    const { executeMutation } = useMutation();
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    const first = executeMutation(() => firstPromise, { isExclusive: true, key });
    await flushPromises();
    const outcome = await executeMutation(() => Promise.resolve(), { isExclusive: true, key });
    resolveFirst();
    await first;

    expect(outcome).toStrictEqual({ status: MutationStatus.Dropped });
  });

  test("drops a concurrent exclusive call with the same key", async () => {
    expect.hasAssertions();

    const { executeMutation } = useMutation();
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    const mutate = vi.fn<() => Promise<void>>();
    mutate.mockReturnValueOnce(firstPromise);
    const first = executeMutation(mutate, { isExclusive: true, key });
    await executeMutation(mutate, { isExclusive: true, key });
    await flushPromises();
    resolveFirst();
    await first;

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  test("runs onSuccess for overlapping calls with different keys", async () => {
    expect.hasAssertions();

    const firstOnSuccess = vi.fn<() => void>();
    const secondOnSuccess = vi.fn<() => void>();
    const { executeMutation } = useMutation();
    const { promise: firstPromise, resolve: resolveFirst } = Promise.withResolvers<void>();
    const first = executeMutation(() => firstPromise, { key, onSuccess: firstOnSuccess });
    await executeMutation(() => Promise.resolve(), { key: otherKey, onSuccess: secondOnSuccess });
    resolveFirst();
    await first;

    expect(firstOnSuccess).toHaveBeenCalledTimes(1);
    expect(secondOnSuccess).toHaveBeenCalledTimes(1);
  });
});
