// @vitest-environment nuxt
import { useScrollStore } from "@/store/message/ui/scroll";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useScrollStore, () => {
  const rowKey = crypto.randomUUID();

  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("setActiveRowKey clears activeRowKey after highlight delay", () => {
    expect.hasAssertions();

    const scrollStore = useScrollStore();
    const { setActiveRowKey } = scrollStore;
    const { activeRowKey } = storeToRefs(scrollStore);
    setActiveRowKey(rowKey);

    expect(activeRowKey.value).toBe(rowKey);

    vi.runAllTimers();

    expect(activeRowKey.value).toBe("");
  });
});
