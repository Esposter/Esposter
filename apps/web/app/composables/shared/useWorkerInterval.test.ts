// @vitest-environment nuxt
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test, vi } from "vitest";

// The timer worker needs a Web Worker, which the test environment has no equivalent for — the
// Delegation keeps the composable's own scheduling under vitest's fake timers
vi.mock(import("@/services/shared/getWorkerTimers"), () => ({
  getWorkerTimers: () => ({
    clearInterval: (intervalId: number) => {
      window.clearInterval(intervalId);
    },
    // The timeout half the worker timers carry too, so the stand-in has their whole shape
    clearTimeout: (timeoutId: number) => {
      window.clearTimeout(timeoutId);
    },
    // Through `window` rather than `globalThis`, whose node-typed overload returns a Timeout where the worker's
    // Timers hand back the number their own clearInterval takes
    setInterval: <TArgs extends unknown[]>(callback: (...args: TArgs) => void, intervalMs?: number, ...args: TArgs) =>
      window.setInterval(callback, intervalMs, ...args),
    setTimeout: <TArgs extends unknown[]>(callback: (...args: TArgs) => void, delayMs?: number, ...args: TArgs) =>
      window.setTimeout(callback, delayMs, ...args),
  }),
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
