// @vitest-environment nuxt
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

// The worker-timers package needs a Web Worker, which the test environment has no equivalent for — the
// Delegation keeps the composable's own scheduling under vitest's fake timers
vi.mock(import("worker-timers"), () => ({
  clearInterval: (intervalId: number) => {
    window.clearInterval(intervalId);
  },
  // Through `window` rather than `globalThis`, whose node-typed overload returns a Timeout where worker-timers
  // Hands back the number its own clearInterval takes
  setInterval: (callback: () => void, intervalMs: number) => window.setInterval(callback, intervalMs),
}));

describe(useWorkerInterval, () => {
  const intervalMs = 1;

  afterEach(() => {
    vi.useRealTimers();
  });

  test("stops calling back once the component unmounts", async () => {
    expect.hasAssertions();

    const callback = vi.fn<() => void>();
    vi.useFakeTimers();
    const wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          useWorkerInterval(callback, intervalMs);
        },
      }),
    );
    vi.advanceTimersByTime(intervalMs);

    expect(callback).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    vi.advanceTimersByTime(intervalMs);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
