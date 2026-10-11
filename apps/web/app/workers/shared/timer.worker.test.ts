import type { TimerRequest } from "@/models/shared/TimerRequest";

import { TimerMethod } from "@/models/shared/TimerMethod";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const delayMs = 10;

// The worker module attaches its listener as it loads, so each test loads a fresh copy against a fake worker scope
const loadWorker = async () => {
  const scope = {
    addEventListener: vi.fn<(type: string, listener: (event: MessageEvent<TimerRequest>) => void) => void>(),
    postMessage: vi.fn<(response: unknown) => void>(),
  };
  vi.stubGlobal("self", scope);
  await import("@/workers/shared/timer.worker");
  const [, listener] = scope.addEventListener.mock.calls[0] ?? [];
  return {
    post: (request: TimerRequest) => {
      listener?.(new MessageEvent("message", { data: request }));
    },
    scope,
  };
};

describe("timer.worker", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("reports an interval's id on every fire until it is cleared", async () => {
    expect.hasAssertions();
    const { post, scope } = await loadWorker();
    const id = 1;
    post({ delayMs, id, method: TimerMethod.SetInterval });

    vi.advanceTimersByTime(delayMs);
    vi.advanceTimersByTime(delayMs);
    expect(scope.postMessage).toHaveBeenCalledTimes(2);
    expect(scope.postMessage).toHaveBeenLastCalledWith({ id });

    post({ id, method: TimerMethod.ClearInterval });
    vi.advanceTimersByTime(delayMs);
    expect(scope.postMessage).toHaveBeenCalledTimes(2);
  });

  test("reports a timeout's id once, then forgets it", async () => {
    expect.hasAssertions();
    const { post, scope } = await loadWorker();
    const id = 1;
    post({ delayMs, id, method: TimerMethod.SetTimeout });

    vi.advanceTimersByTime(delayMs);
    vi.advanceTimersByTime(delayMs);
    expect(scope.postMessage).toHaveBeenCalledExactlyOnceWith({ id });
  });

  test("a cleared timeout never reports its id", async () => {
    expect.hasAssertions();
    const { post, scope } = await loadWorker();
    const id = 1;
    post({ delayMs, id, method: TimerMethod.SetTimeout });

    post({ id, method: TimerMethod.ClearTimeout });
    vi.advanceTimersByTime(delayMs);
    expect(scope.postMessage).not.toHaveBeenCalled();
  });

  test("clearing an id it never scheduled does nothing", async () => {
    expect.hasAssertions();
    const { post, scope } = await loadWorker();

    expect(() => {
      post({ id: 1, method: TimerMethod.ClearInterval });
    }).not.toThrow();
    expect(scope.postMessage).not.toHaveBeenCalled();
  });
});
