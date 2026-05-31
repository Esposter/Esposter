import { dayjs } from "#shared/services/dayjs";
import { useScrollStore } from "@/store/message/ui/scroll";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useScrollStore, () => {
  const rowKey = crypto.randomUUID();
  const secondRowKey = crypto.randomUUID();
  const highlightMs = dayjs.duration(2, "seconds").asMilliseconds();

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

    vi.advanceTimersByTime(highlightMs - 1);

    expect(activeRowKey.value).toBe(rowKey);

    vi.advanceTimersByTime(1);

    expect(activeRowKey.value).toBe("");
  });

  test("setActiveRowKey restarts the clear timer", () => {
    expect.hasAssertions();

    const scrollStore = useScrollStore();
    const { setActiveRowKey } = scrollStore;
    const { activeRowKey } = storeToRefs(scrollStore);
    setActiveRowKey(rowKey);
    vi.advanceTimersByTime(highlightMs - 1);
    setActiveRowKey(secondRowKey);
    vi.advanceTimersByTime(1);

    expect(activeRowKey.value).toBe(secondRowKey);

    vi.advanceTimersByTime(highlightMs - 1);

    expect(activeRowKey.value).toBe("");
  });
});
