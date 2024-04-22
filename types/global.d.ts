import type { Entries } from "type-fest";
import type { WebSocketServer } from "ws";

declare global {
  // eslint-disable-next-line no-var
  var websocketServer: WebSocketServer | undefined;

  interface ObjectConstructor {
    entries<T extends object>(o: T): Entries<T>;
  }
}
