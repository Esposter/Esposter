import type { EventEmitter } from "node:events";
import type { SuperJSONResult } from "superjson";

import { transformer } from "#shared/services/trpc/transformer";
import { on as baseOn } from "node:events";

export async function* onDeserialized<
  TKey extends keyof TEventMap,
  TValue extends TEventMap[TKey] & unknown[],
  TEventMap extends Record<keyof TEventMap, TValue>,
>(
  eventEmitter: EventEmitter<TEventMap>,
  eventName: string & TKey,
  options?: Parameters<typeof baseOn>[2],
): AsyncGenerator<[TValue[number]]> {
  for await (const [serializedData] of baseOn(eventEmitter as EventEmitter, eventName, options) as NodeJS.AsyncIterator<
    [SuperJSONResult]
  >) {
    const data = transformer.deserialize<TValue[number]>(serializedData);
    yield [data];
  }
}
