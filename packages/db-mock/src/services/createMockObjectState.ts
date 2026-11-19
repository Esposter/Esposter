import type { SQLInputValue } from "node:sqlite";

import { DatabaseSync } from "node:sqlite";

// A socket the runtime accepted, as the object and the registry see it: the object sends and closes it, and the socket reports
// Its close, so the registry drops it
export interface MockObjectSocket {
  close: (code: number, reason: string) => void;
  onClose: (listener: () => void) => void;
  send: (frame: string) => void;
}

// The rows of a statement as the driver reads them: one at a time, whole, or as arrays of column values
const createCursor = (rows: unknown[]) => {
  const iterator = rows[Symbol.iterator]();
  return { next: () => iterator.next(), toArray: () => rows };
};

// The state a Durable Object runs on, for a test in any suite. The SQLite is a real in-memory database, behind the SqlStorage
// Shape the runtime gives an object. The socket registry answers getWebSockets and getTags as the runtime does. So a second
// Object over the same state reads back the first's writes. A closed socket leaves the registry, so a close handler sees
// Only the sockets still open. The alarm and the key-value storage are held as the runtime holds them, and deleteAll starts
// Both again empty
export const createMockObjectState = (name: string) => {
  let database = new DatabaseSync(":memory:");
  const keyValues = new Map<string, unknown>();
  const socketTags = new Map<MockObjectSocket, string[]>();
  let pendingWork: Promise<unknown>[] = [];
  let alarm: null | number = null;
  const ctx = {
    acceptWebSocket: (socket: MockObjectSocket, tags: string[]) => {
      socketTags.set(socket, tags);
      socket.onClose(() => {
        socketTags.delete(socket);
      });
    },
    blockConcurrencyWhile: <T>(closure: () => Promise<T>) => closure(),
    getTags: (socket: MockObjectSocket) => socketTags.get(socket) ?? [],
    getWebSockets: (tag?: string) =>
      [...socketTags].filter(([, tags]) => tag === undefined || tags.includes(tag)).map(([socket]) => socket),
    id: { name },
    storage: {
      delete: (key: string) => Promise.resolve(keyValues.delete(key)),
      deleteAlarm: () => {
        alarm = null;
        return Promise.resolve();
      },
      deleteAll: () => {
        database = new DatabaseSync(":memory:");
        keyValues.clear();
        alarm = null;
        return Promise.resolve();
      },
      get: (key: string) => Promise.resolve(keyValues.get(key)),
      getAlarm: () => Promise.resolve(alarm),
      list: ({ prefix }: { prefix: string }) =>
        Promise.resolve(new Map([...keyValues].filter(([key]) => key.startsWith(prefix)))),
      put: (key: string, value: unknown) => {
        keyValues.set(key, value);
        return Promise.resolve();
      },
      setAlarm: (time: number) => {
        alarm = time;
        return Promise.resolve();
      },
      sql: {
        exec: (query: string, ...bindings: SQLInputValue[]) => {
          const rows = database.prepare(query).all(...bindings) as Record<string, unknown>[];
          return { ...createCursor(rows), raw: () => createCursor(rows.map((row) => Object.values(row))) };
        },
      },
      transactionSync: <T>(closure: () => T) => {
        database.exec("BEGIN");
        const result = closure();
        database.exec("COMMIT");
        return result;
      },
    },
    waitUntil: (promise: Promise<unknown>) => {
      pendingWork.push(promise);
    },
  };
  return {
    ctx,
    get database() {
      return database;
    },
    // Settles the work an object handed to waitUntil, which the runtime keeps running past the response it answered
    settleWaitUntil: () => {
      const settling = pendingWork;
      pendingWork = pendingWork.toSpliced(0);
      return Promise.all(settling);
    },
  };
};

export type MockObjectState = ReturnType<typeof createMockObjectState>;
