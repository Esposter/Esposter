import type { TimerRequest } from "@/models/shared/TimerRequest";
import type { TimerResponse } from "@/models/shared/TimerResponse";

import { TimerMethod } from "@/models/shared/TimerMethod";

interface PendingTimer {
  callback: () => void;
  isInterval: boolean;
}
// The page side of the timer worker: ids start at 1 as the spec requires, a call to clear an id that is not pending
// Does nothing as the spec does, and a timeout is forgotten as it fires
export const createWorkerTimers = (worker: Pick<Worker, "addEventListener" | "postMessage">) => {
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

  const schedule = <TArgs extends unknown[]>(
    method: TimerMethod.SetInterval | TimerMethod.SetTimeout,
    callback: (...args: TArgs) => void,
    args: TArgs,
    delayMs = 0,
  ) => {
    lastId += 1;
    const id = lastId;
    pendingTimers.set(id, {
      callback: () => {
        callback(...args);
      },
      isInterval: method === TimerMethod.SetInterval,
    });
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
    setInterval: <TArgs extends unknown[]>(callback: (...args: TArgs) => void, delayMs?: number, ...args: TArgs) =>
      schedule(TimerMethod.SetInterval, callback, args, delayMs),
    setTimeout: <TArgs extends unknown[]>(callback: (...args: TArgs) => void, delayMs?: number, ...args: TArgs) =>
      schedule(TimerMethod.SetTimeout, callback, args, delayMs),
  };
};
