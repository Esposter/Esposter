export type ExtractUpdateEvent<TUpdateEvent extends string> = TUpdateEvent extends `update:${infer TEvent}`
  ? TEvent
  : TUpdateEvent;
