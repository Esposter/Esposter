import type { WatchCallback, WatchStopHandle } from "vue";

import { dayjs } from "#shared/services/dayjs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe("watchTracker", () => {
  const source = ref("");
  const callback: WatchCallback<typeof source.value> = vi.fn(() => {});
  let watchStopHandlers: WatchStopHandle[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    source.value = "";
    watchStopHandlers = watchTracker(source, callback);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    for (const watchStopHandler of watchStopHandlers) watchStopHandler();
  });

  test("callback is not run on first source change", async () => {
    expect.hasAssertions();

    source.value = "test";
    await nextTick();

    expect(callback).not.toHaveBeenCalled();
  });

  test("callback is not run on second source change less than debounce time", async () => {
    expect.hasAssertions();

    source.value = "test";
    await nextTick();
    source.value = "";
    await nextTick();
    vi.advanceTimersByTime(dayjs.duration(0.49, "seconds").asMilliseconds());

    expect(callback).not.toHaveBeenCalled();
  });

  test("callback is run on second source change greater than debounce time", async () => {
    expect.hasAssertions();

    source.value = "test";
    await nextTick();
    source.value = "";
    await nextTick();
    vi.advanceTimersByTime(dayjs.duration(0.5, "seconds").asMilliseconds());

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
