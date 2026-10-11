export interface EventListenerEntry<TEventMap> {
  isOnce: boolean;
  listener: TEventMap[keyof TEventMap];
}
