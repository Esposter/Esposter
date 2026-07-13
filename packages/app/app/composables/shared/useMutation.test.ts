// @vitest-environment nuxt
import { useAlertStore } from "@/store/alert";
import { noop } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useMutation, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("applies optimistically and keeps the change on success", async () => {
    expect.hasAssertions();

    const rollback = vi.fn<() => void>();
    const applyOptimistic = vi.fn<() => () => void>(() => rollback);
    const executeMutation = useMutation();
    await executeMutation(() => Promise.resolve(), { applyOptimistic });

    expect(applyOptimistic).toHaveBeenCalledTimes(1);
    expect(rollback).not.toHaveBeenCalled();
  });

  test("passes the resolved result to onSuccess", async () => {
    expect.hasAssertions();

    const onSuccess = vi.fn<(result: string) => void>();
    const executeMutation = useMutation();
    await executeMutation(() => Promise.resolve("result"), { onSuccess });

    expect(onSuccess).toHaveBeenCalledExactlyOnceWith("result");
  });

  test("rolls back and alerts on failure", async () => {
    expect.hasAssertions();

    const rollback = vi.fn<() => void>();
    const applyOptimistic = vi.fn<() => () => void>(() => rollback);
    const executeMutation = useMutation();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await executeMutation(() => Promise.reject(new Error("error")), { applyOptimistic });

    expect(rollback).toHaveBeenCalledTimes(1);
    expect(alerts.value).toHaveLength(1);
  });

  test("does not roll back a superseded call once a newer one has started", async () => {
    expect.hasAssertions();

    const staleRollback = vi.fn<() => void>();
    const executeMutation = useMutation();
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
});
