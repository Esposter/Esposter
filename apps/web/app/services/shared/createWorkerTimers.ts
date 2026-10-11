import type { TimerRequest } from "@/models/shared/TimerRequest";
import type { TimerResponse } from "@/models/shared/TimerResponse";

import { TimerMethod } from "@/models/shared/TimerMethod";

interface PendingTimer {
  callback: (...args: unknown[]) => void;
  isInterval: boolean;
}

// The page side of the timer worker: ids start at 1 as the spec requires, a call to clear an id that is not pending
// Does nothing as the spec does, and a timeout is forgotten as it fires
export const createWorkerTimers = (worker: Worker) => {
  const pendingTimers = new Map<number, PendingTimer>();
  let lastId = 0;

  worker.addEventListener("message", (event: MessageEvent<TimerResponse>) => {
    const pendingTimer = pendingTimers.get(event.data.id);
    if (!pendingTimer) return;

    if (!pendingTimer.isInterval) pendingTimers.delete(event.data.id);
    pendingTimer.callback();
  });

  const post = (request: TimerRequest) => {
    // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a dedicated worker's postMessage takes a transfer list, not a target origin
    worker.postMessage(request);
  };

  const schedule = (
    method: TimerMethod.SetInterval | TimerMethod.SetTimeout,
    callback: (...args: unknown[]) => void,
    delayMs = 0,
    args: unknown[] = [],
  ) => {
    lastId += 1;
    const id = lastId;
    pendingTimers.set(id, { callback: () => callback(...args), isInterval: method === TimerMethod.SetInterval });
    post({ delayMs, id, method } satisfies TimerRequest);
    return id;
  };

  const clear = (method: TimerMethod.ClearInterval | TimerMethod.ClearTimeout, id: number) => {
    if (!pendingTimers.delete(id)) return;

    post({ id, method } satisfies TimerRequest);
  };

  return {
    clearInterval: (id: number) => {
      clear(TimerMethod.ClearInterval, id);
    },
    clearTimeout: (id: number) => {
      clear(TimerMethod.ClearTimeout, id);
    },
    setInterval: (callback: (...args: unknown[]) => void, delayMs?: number, ...args: unknown[]) =>
      schedule(TimerMethod.SetInterval, callback, delayMs, args),
    setTimeout: (callback: (...args: unknown[]) => void, delayMs?: number, ...args: unknown[]) =>
      schedule(TimerMethod.SetTimeout, callback, delayMs, args),
  };
};
