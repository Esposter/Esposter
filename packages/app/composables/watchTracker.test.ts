import { dayjs } from "@/services/dayjs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { WatchCallback, WatchStopHandle } from "vue";

describe("Watch Tracker", () => {
  const source = ref("");
  const callback: WatchCallback<typeof source.value> = vi.fn(() => {});
  let watchStopHandlers: WatchStopHandle[] = [];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    source.value = "";
    watchStopHandlers = watchTracker(source, callback);
  });

  afterEach(() => {
    vi.useRealTimers();
    for (const watchStopHandler of watchStopHandlers) watchStopHandler();
  });

  test("callback is not run on first source change", async () => {
    source.value = "test";
    await nextTick();
    expect(callback).not.toBeCalled();
  });

  test("callback is not run on second source change less than debounce time", async () => {
    source.value = "test";
    await nextTick();
    source.value = "";
    await nextTick();
    vi.advanceTimersByTime(dayjs.duration(0.49, "seconds").asMilliseconds());
    expect(callback).not.toBeCalled();
  });

  test("callback is run on second source change greater than debounce time", async () => {
    source.value = "test";
    await nextTick();
    source.value = "";
    await nextTick();
    vi.advanceTimersByTime(dayjs.duration(0.5, "seconds").asMilliseconds());
    expect(callback).toBeCalledTimes(1);
  });
});
