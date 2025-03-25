import type { EventEmitter } from "node:events";

import { on as baseOn } from "node:events";

export const on = <TKey extends keyof TEventMap, TEventMap extends Record<keyof TEventMap, TEventMap[TKey]>>(
  eventEmitter: EventEmitter<TEventMap>,
  eventName: string & TKey,
  options?: Parameters<typeof baseOn>[2],
) => baseOn(eventEmitter as EventEmitter, eventName, options) as NodeJS.AsyncIterator<TEventMap[TKey]>;
