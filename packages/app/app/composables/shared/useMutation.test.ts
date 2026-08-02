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
    const { alerts } = storeToRefs(useAlertStore());
    const error = new Error("error");
    await executeMutation(() => Promise.reject(error), { key, onError });

    expect(onError).toHaveBeenCalledExactlyOnceWith(error);
    expect(alerts.value).toHaveLength(0);
  });

  test("queues writes to one target so each starts only after the one ahead of it settles", async () => {
    expect.hasAssertions();

    const startOrder: string[] = [];
    const { executeMutation } = useMutation();
    let resolveFirst: () => void = noop;
    const first = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          startOrder.push("first");
          resolveFirst = resolve;
        }),
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
    let resolveFirst: () => void = noop;
    const first = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve;
        }),
      { key, onSuccess: firstOnSuccess },
    );
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
    const { alerts } = storeToRefs(useAlertStore());
    let resolveFirst: () => void = noop;
    const first = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve;
        }),
      { key },
    );
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
    let rejectFirst: (reason: unknown) => void = noop;
    const first = executeMutation(
      () =>
        new Promise<void>((_, reject) => {
          rejectFirst = reject;
        }),
      { key, onError: noop },
    );
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
    let resolveFirst: () => void = noop;
    const first = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          startOrder.push("first");
          resolveFirst = resolve;
        }),
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
    const { alerts } = storeToRefs(useAlertStore());
    let rejectSuperseded: (reason: unknown) => void = noop;
    const superseded = executeMutation(
      () =>
        new Promise<void>((_, reject) => {
          rejectSuperseded = reject;
        }),
      { applyOptimistic: () => rollback, isSupersede: true, key },
    );
    await executeMutation(() => Promise.resolve(), { isSupersede: true, key });
    rejectSuperseded(new Error("error"));
    await superseded;

    expect(rollback).toHaveBeenCalledTimes(1);
    expect(alerts.value).toHaveLength(1);
  });

  test("reports a superseded write as stale rather than succeeded", async () => {
    expect.hasAssertions();

    const { executeMutation } = useMutation();
    let resolveSuperseded: () => void = noop;
    const superseded = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          resolveSuperseded = resolve;
        }),
      { isSupersede: true, key },
    );
    await executeMutation(() => Promise.resolve(), { isSupersede: true, key });
    resolveSuperseded();

    expect(await superseded).toStrictEqual({ status: MutationStatus.Stale });
  });

  test("drops the superseded onSuccess for overlapping supersede writes with the same key", async () => {
    expect.hasAssertions();

    const supersededOnSuccess = vi.fn<() => void>();
    const freshOnSuccess = vi.fn<() => void>();
    const { executeMutation } = useMutation();
    let resolveSuperseded: () => void = noop;
    const superseded = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          resolveSuperseded = resolve;
        }),
      { isSupersede: true, key, onSuccess: supersededOnSuccess },
    );
    await executeMutation(() => Promise.resolve(), { isSupersede: true, key, onSuccess: freshOnSuccess });
    resolveSuperseded();
    await superseded;

    expect(supersededOnSuccess).not.toHaveBeenCalled();
    expect(freshOnSuccess).toHaveBeenCalledTimes(1);
  });

  test("runs reads for one target concurrently and keeps only the latest", async () => {
    expect.hasAssertions();

    const supersededOnSuccess = vi.fn<() => void>();
    const freshOnSuccess = vi.fn<() => void>();
    const { executeQuery } = useMutation();
    let resolveSuperseded: () => void = noop;
    const superseded = executeQuery(
      () =>
        new Promise<void>((resolve) => {
          resolveSuperseded = resolve;
        }),
      { key, onSuccess: supersededOnSuccess },
    );
    await executeQuery(() => Promise.resolve(), { key, onSuccess: freshOnSuccess });
    resolveSuperseded();

    expect(await superseded).toStrictEqual({ status: MutationStatus.Stale });
    expect(supersededOnSuccess).not.toHaveBeenCalled();
    expect(freshOnSuccess).toHaveBeenCalledTimes(1);
  });

  test("drops a superseded read's failure without alerting", async () => {
    expect.hasAssertions();

    const { executeQuery } = useMutation();
    const { alerts } = storeToRefs(useAlertStore());
    let rejectSuperseded: (reason: unknown) => void = noop;
    const superseded = executeQuery(
      () =>
        new Promise<void>((_, reject) => {
          rejectSuperseded = reject;
        }),
      { key },
    );
    await executeQuery(() => Promise.resolve(), { key });
    rejectSuperseded(new Error("error"));

    expect(await superseded).toStrictEqual({ status: MutationStatus.Stale });
    expect(alerts.value).toHaveLength(0);
  });

  test("alerts a read that fails while it is still the latest", async () => {
    expect.hasAssertions();

    const { executeQuery } = useMutation();
    const { alerts } = storeToRefs(useAlertStore());
    const outcome = await executeQuery(() => Promise.reject(new Error("error")), { key });

    expect(outcome.status).toBe(MutationStatus.Failed);
    expect(alerts.value).toHaveLength(1);
  });

  test("tracks pending state across a call's lifecycle", async () => {
    expect.hasAssertions();

    const { executeMutation, isPending } = useMutation();
    let resolveMutate: () => void = noop;
    const pending = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          resolveMutate = resolve;
        }),
      { key },
    );
    const isPendingWhileInFlight = isPending.value;
    await flushPromises();
    resolveMutate();
    await pending;

    expect(isPendingWhileInFlight).toBe(true);
    expect(isPending.value).toBe(false);
  });

  test("scopes getIsPending to its key while isPending aggregates", async () => {
    expect.hasAssertions();

    const { executeMutation, getIsPending, isPending } = useMutation();
    let resolveMutate: () => void = noop;
    const pending = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          resolveMutate = resolve;
        }),
      { key },
    );
    const isKeyPendingWhileInFlight = getIsPending(key);
    const isOtherKeyPendingWhileInFlight = getIsPending(otherKey);
    await flushPromises();
    resolveMutate();
    await pending;

    expect(isKeyPendingWhileInFlight).toBe(true);
    expect(isOtherKeyPendingWhileInFlight).toBe(false);
    expect(isPending.value).toBe(false);
    expect(getIsPending(key)).toBe(false);
  });

  test("clears pending state when onSuccess throws", async () => {
    expect.hasAssertions();

    const { executeMutation, getIsPending, isPending } = useMutation();

    await expect(
      executeMutation(() => Promise.resolve(), {
        key,
        onSuccess: () => {
          throw new Error("error");
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: error]`);

    expect(getIsPending(key)).toBe(false);
    expect(isPending.value).toBe(false);
  });

  test("clears pending state when onError throws", async () => {
    expect.hasAssertions();

    const { executeMutation, getIsPending, isPending } = useMutation();

    await expect(
      executeMutation(() => Promise.reject(new Error("error")), {
        key,
        onError: () => {
          throw new Error(" ");
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);

    expect(getIsPending(key)).toBe(false);
    expect(isPending.value).toBe(false);
  });

  test("clears pending state when applyOptimistic throws", async () => {
    expect.hasAssertions();

    const { executeMutation, getIsPending, isPending } = useMutation();

    await expect(
      executeMutation(() => Promise.resolve(), {
        applyOptimistic: () => {
          throw new Error("error");
        },
        key,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: error]`);

    expect(isPending.value).toBe(false);
    expect(getIsPending(key)).toBe(false);
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
    let resolveFirst: () => void = noop;
    const first = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve;
        }),
      { isExclusive: true, key },
    );
    await flushPromises();
    const outcome = await executeMutation(() => Promise.resolve(), { isExclusive: true, key });
    resolveFirst();
    await first;

    expect(outcome).toStrictEqual({ status: MutationStatus.Dropped });
  });

  test("drops a concurrent exclusive call with the same key", async () => {
    expect.hasAssertions();

    const { executeMutation } = useMutation();
    let resolveFirst: () => void = noop;
    const mutate = vi.fn<() => Promise<void>>();
    mutate.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve;
        }),
    );
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
    let resolveFirst: () => void = noop;
    const first = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve;
        }),
      { key, onSuccess: firstOnSuccess },
    );
    await executeMutation(() => Promise.resolve(), { key: otherKey, onSuccess: secondOnSuccess });
    resolveFirst();
    await first;

    expect(firstOnSuccess).toHaveBeenCalledTimes(1);
    expect(secondOnSuccess).toHaveBeenCalledTimes(1);
  });
});
