// @vitest-environment nuxt
import { useAlertStore } from "@/store/alert";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe(useOptimisticMutation, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("applies optimistically and keeps the change on success", async () => {
    expect.hasAssertions();

    const rollback = vi.fn();
    const applyOptimistic = vi.fn(() => rollback);
    const executeOptimisticMutation = useOptimisticMutation();
    await executeOptimisticMutation(applyOptimistic, () => Promise.resolve());

    expect(applyOptimistic).toHaveBeenCalledTimes(1);
    expect(rollback).not.toHaveBeenCalled();
  });

  test("rolls back and alerts on failure", async () => {
    expect.hasAssertions();

    const rollback = vi.fn();
    const applyOptimistic = vi.fn(() => rollback);
    const executeOptimisticMutation = useOptimisticMutation();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await executeOptimisticMutation(applyOptimistic, () => Promise.reject(new Error("error")));

    expect(rollback).toHaveBeenCalledTimes(1);
    expect(alerts.value).toHaveLength(1);
  });
});
