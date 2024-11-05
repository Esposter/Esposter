import type { Entries } from "type-fest";
import type { WebSocketServer } from "ws";

declare global {
  // eslint-disable-next-line no-var
  var websocketServer: undefined | WebSocketServer;

  interface ObjectConstructor {
    entries<T extends object>(o: T): Entries<T>;

    fromEntries<T extends readonly [PropertyKey, unknown]>(entries: Iterable<T>): Record<T[0], T[1]>;

    groupBy<K extends PropertyKey, T>(items: Iterable<T>, keySelector: (item: T, index: number) => K): Record<K, T[]>;
  }
}
