import type { EventEmitter } from "node:events";

import { on } from "#server/services/events/on";
import { getResultAsync } from "@esposter/shared";

// The events of `eventEmitter` for as long as the subscriber has not departed. A subscription checks its access once,
// When it opens, so the departure has to end the stream itself. `onDeparture` is handed `depart`, subscribes it to the
// Event that announces the departure, and returns how to unsubscribe. The listeners are attached here, not when the
// Stream is first read, so a caller that awaits before its first read cannot miss a departure that lands in that gap
export const onUntilDeparture = <TKey extends keyof TEventMap, TEventMap extends Record<TKey, TEventMap[TKey]>>(
  eventEmitter: EventEmitter<TEventMap>,
  eventName: string & TKey,
  { onDeparture, signal }: { onDeparture: (depart: () => void) => () => void; signal?: AbortSignal },
): AsyncIterable<TEventMap[TKey]> => {
  const departure = new AbortController();
  const ended = AbortSignal.any(signal ? [signal, departure.signal] : [departure.signal]);
  const events = on(eventEmitter, eventName, { signal: ended });
  const unsubscribe = onDeparture(() => {
    departure.abort();
  });
  ended.addEventListener("abort", unsubscribe, { once: true });
  // The departure aborts the read that is waiting, and an aborted read is the stream's end rather than a failure.
  // Any other rejection is the stream's own error, and is thrown as it was
  const next = () =>
    getResultAsync(() => events.next()).match(
      (result) => result,
      (error) => {
        if (departure.signal.aborted) return { done: true, value: undefined };
        throw error;
      },
    );
  return { [Symbol.asyncIterator]: () => ({ next }) };
};
