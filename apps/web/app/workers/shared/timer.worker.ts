import type { TimerRequest } from "@/models/shared/TimerRequest";
import type { TimerResponse } from "@/models/shared/TimerResponse";

import { TimerMethod } from "@/models/shared/TimerMethod";

// Timers scheduled here keep their pace while the tab is backgrounded, where the browser throttles the page's own
// Timers. The worker holds only the native handles, so the page owns the ids and the callbacks and a fired timer is
// Reported back by its id
const handles = new Map<number, number>();

const reportFire = (id: number) => {
  // oxlint-disable-next-line unicorn/require-post-message-target-origin -- a dedicated worker's postMessage takes a transfer list, not a target origin
  self.postMessage({ id } satisfies TimerResponse);
};

self.addEventListener("message", (event: MessageEvent<TimerRequest>) => {
  const request = event.data;
  if (request.method === TimerMethod.SetInterval)
    handles.set(
      request.id,
      setInterval(() => {
        reportFire(request.id);
      }, request.delayMs),
    );
  else if (request.method === TimerMethod.SetTimeout)
    handles.set(
      request.id,
      setTimeout(() => {
        handles.delete(request.id);
        reportFire(request.id);
      }, request.delayMs),
    );
  else {
    const handle = handles.get(request.id);
    if (handle === undefined) return;

    handles.delete(request.id);
    // Every browser keeps one list of timers for both clear methods, so either clears a timeout or an interval
    clearInterval(handle);
  }
});
