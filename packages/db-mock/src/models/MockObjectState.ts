import type { MockObjectCursor } from "#src/models/MockObjectCursor";
import type { MockObjectSocket } from "#src/models/MockObjectSocket";
import type { DatabaseSync, SQLInputValue } from "node:sqlite";

// The state a Durable Object runs on, as the runtime gives it to the object's constructor
export interface MockObjectState {
  ctx: {
    acceptWebSocket: (socket: MockObjectSocket, tags: string[]) => void;
    blockConcurrencyWhile: <T>(closure: () => Promise<T>) => Promise<T>;
    getTags: (socket: MockObjectSocket) => string[];
    getWebSockets: (tag?: string) => MockObjectSocket[];
    id: { name: string };
    storage: {
      delete: (key: string) => Promise<boolean>;
      deleteAlarm: () => Promise<void>;
      deleteAll: () => Promise<void>;
      get: (key: string) => Promise<unknown>;
      getAlarm: () => Promise<null | number>;
      list: (options: { prefix: string }) => Promise<Map<string, unknown>>;
      put: (key: string, value: unknown) => Promise<void>;
      setAlarm: (time: number) => Promise<void>;
      sql: {
        exec: (query: string, ...bindings: SQLInputValue[]) => MockObjectCursor & { raw: () => MockObjectCursor };
      };
      transactionSync: <T>(closure: () => T) => T;
    };
    waitUntil: (promise: Promise<unknown>) => void;
  };
  readonly database: DatabaseSync;
  // Settles the work an object handed to waitUntil, which the runtime keeps running past the response it answered
  settleWaitUntil: () => Promise<unknown[]>;
}
