import type { UpdateEvent } from "#src/models/emit/UpdateEvent";

export type EmitsOptionsFor<TConfiguration extends object> = {
  [TKey in keyof TConfiguration & string as UpdateEvent<TKey>]: [TConfiguration[TKey]?];
};
