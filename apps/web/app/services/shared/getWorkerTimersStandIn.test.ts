import { describe } from "vitest";

// The timer worker needs a Web Worker, which the test environment has no equivalent for. The stand-in runs the same
// Intervals and timeouts on window's timers, so vitest's fake timers drive the composables' own scheduling
export const getWorkerTimers = () => ({
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
});

describe.todo("getWorkerTimersStandIn");
