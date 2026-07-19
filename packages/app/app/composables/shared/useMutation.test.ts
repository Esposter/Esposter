// @vitest-environment nuxt
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
    await executeMutation(() => Promise.resolve(), { applyOptimistic });

    expect(applyOptimistic).toHaveBeenCalledTimes(1);
    expect(rollback).not.toHaveBeenCalled();
  });

  test("passes the resolved result to onSuccess", async () => {
    expect.hasAssertions();

    const onSuccess = vi.fn<(result: string) => void>();
    const { executeMutation } = useMutation();
    await executeMutation(() => Promise.resolve("result"), { onSuccess });

    expect(onSuccess).toHaveBeenCalledExactlyOnceWith("result");
  });

  test("rolls back and alerts on failure", async () => {
    expect.hasAssertions();

    const rollback = vi.fn<() => void>();
    const applyOptimistic = vi.fn<() => () => void>(() => rollback);
    const { executeMutation } = useMutation();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await executeMutation(() => Promise.reject(new Error("error")), { applyOptimistic });

    expect(rollback).toHaveBeenCalledTimes(1);
    expect(alerts.value).toHaveLength(1);
  });

  test("routes failure to onError instead of the default alert", async () => {
    expect.hasAssertions();

    const onError = vi.fn<(error: Error) => void>();
    const { executeMutation } = useMutation();
    const { alerts } = storeToRefs(useAlertStore());
    const error = new Error("error");
    await executeMutation(() => Promise.reject(error), { onError });

    expect(onError).toHaveBeenCalledExactlyOnceWith(error);
    expect(alerts.value).toHaveLength(0);
  });

  test("does not roll back a superseded call once a newer one has started", async () => {
    expect.hasAssertions();

    const staleRollback = vi.fn<() => void>();
    const { executeMutation } = useMutation();
    const { alerts } = storeToRefs(useAlertStore());
    let rejectStale: (reason: unknown) => void = noop;
    const stale = executeMutation(
      () =>
        new Promise<void>((_, reject) => {
          rejectStale = reject;
        }),
      {
        applyOptimistic: () => staleRollback,
      },
    );
    await executeMutation(() => Promise.resolve());
    rejectStale(new Error("error"));
    await stale;

    expect(staleRollback).not.toHaveBeenCalled();
    expect(alerts.value).toHaveLength(0);
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
    );
    const isPendingWhileInFlight = isPending.value;
    await flushPromises();
    resolveMutate();
    await pending;

    expect(isPendingWhileInFlight).toBe(true);
    expect(isPending.value).toBe(false);
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

    const staleOnSuccess = vi.fn<() => void>();
    const freshOnSuccess = vi.fn<() => void>();
    const { executeMutation } = useMutation();
    let resolveFirst: () => void = noop;
    const first = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          resolveFirst = resolve;
        }),
      { key, onSuccess: staleOnSuccess },
    );
    await executeMutation(() => Promise.resolve(), { key: otherKey, onSuccess: freshOnSuccess });
    resolveFirst();
    await first;

    expect(staleOnSuccess).toHaveBeenCalledTimes(1);
    expect(freshOnSuccess).toHaveBeenCalledTimes(1);
  });

  test("drops the superseded onSuccess for overlapping calls with the same key", async () => {
    expect.hasAssertions();

    const staleOnSuccess = vi.fn<() => void>();
    const freshOnSuccess = vi.fn<() => void>();
    const { executeMutation } = useMutation();
    let resolveStale: () => void = noop;
    const stale = executeMutation(
      () =>
        new Promise<void>((resolve) => {
          resolveStale = resolve;
        }),
      { key, onSuccess: staleOnSuccess },
    );
    await executeMutation(() => Promise.resolve(), { key, onSuccess: freshOnSuccess });
    resolveStale();
    await stale;

    expect(staleOnSuccess).not.toHaveBeenCalled();
    expect(freshOnSuccess).toHaveBeenCalledTimes(1);
  });
});
