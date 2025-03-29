import type { EventEmitter } from "node:events";

import { transformer } from "#shared/services/trpc/transformer";

export const emitSerialized = <
  TKey extends keyof TEventMap,
  TValue extends TEventMap[TKey] & unknown[],
  TEventMap extends Record<TKey, TValue>,
>(
  eventEmitter: EventEmitter<TEventMap>,
  eventName: string & TKey,
  data: TValue[number],
): boolean => {
  const serializedData = transformer.serialize(data);
  console.log(serializedData);
  // We will have to cast it to EventEmitter because the type of emit is not compatible
  // since we are doing custom serializations/deserializations that will change the type of the data
  return (eventEmitter as EventEmitter).emit(eventName, serializedData);
};
