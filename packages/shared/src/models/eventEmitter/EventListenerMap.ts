export type EventListenerMap<TEventMap> = {
  [TEvent in keyof TEventMap]: (...args: never[]) => void;
};
