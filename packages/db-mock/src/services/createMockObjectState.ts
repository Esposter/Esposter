import type { MockObjectCursor } from "#src/models/MockObjectCursor";
import type { MockObjectSocket } from "#src/models/MockObjectSocket";
import type { MockObjectState } from "#src/models/MockObjectState";

import { getResult } from "@esposter/shared";
import { DatabaseSync } from "node:sqlite";

// The rows of a statement as the driver reads them: one at a time, whole, or as arrays of column values
const createCursor = (rows: unknown[]): MockObjectCursor => {
  const iterator = rows[Symbol.iterator]();
  return { next: () => iterator.next(), toArray: () => rows };
};

// The state a Durable Object runs on, for a test in any suite. The SQLite is a real in-memory database, behind the SqlStorage
// Shape the runtime gives an object. The socket registry answers getWebSockets and getTags as the runtime does. So a second
// Object over the same state reads back the first's writes. A closed socket leaves the registry, so a close handler sees
// Only the sockets still open. The alarm and the key-value storage are held as the runtime holds them, and deleteAll starts
// Both again empty
export const createMockObjectState = (name: string): MockObjectState => {
  let database = new DatabaseSync(":memory:");
  const keyValues = new Map<string, unknown>();
  const socketTags = new Map<MockObjectSocket, string[]>();
  let pendingWork: Promise<unknown>[] = [];
  let alarm: null | number = null;
  const ctx: MockObjectState["ctx"] = {
    acceptWebSocket: (socket, tags) => {
      socketTags.set(socket, tags);
      socket.onClose(() => {
        socketTags.delete(socket);
      });
    },
    blockConcurrencyWhile: (closure) => closure(),
    getTags: (socket) => socketTags.get(socket) ?? [],
    getWebSockets: (tag) =>
      [...socketTags].filter(([, tags]) => tag === undefined || tags.includes(tag)).map(([socket]) => socket),
    id: { name },
    storage: {
      delete: (key) => Promise.resolve(keyValues.delete(key)),
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
      get: (key) => Promise.resolve(keyValues.get(key)),
      getAlarm: () => Promise.resolve(alarm),
      list: ({ prefix }) => Promise.resolve(new Map([...keyValues].filter(([key]) => key.startsWith(prefix)))),
      put: (key, value) => {
        keyValues.set(key, value);
        return Promise.resolve();
      },
      setAlarm: (time) => {
        alarm = time;
        return Promise.resolve();
      },
      sql: {
        exec: (query, ...bindings) => {
          const rows = database.prepare(query).all(...bindings);
          return { ...createCursor(rows), raw: () => createCursor(rows.map((row) => Object.values(row))) };
        },
      },
      // As the runtime does, a closure that throws rolls its writes back and rethrows, and one that returns commits them
      transactionSync: (closure) => {
        database.exec("BEGIN");
        return getResult(closure).match(
          (result) => {
            database.exec("COMMIT");
            return result;
          },
          (error) => {
            database.exec("ROLLBACK");
            throw error;
          },
        );
      },
    },
    waitUntil: (promise) => {
      pendingWork.push(promise);
    },
  };
  return {
    ctx,
    get database() {
      return database;
    },
    settleWaitUntil: () => {
      const settling = pendingWork;
      pendingWork = pendingWork.toSpliced(0);
      return Promise.all(settling);
    },
  };
};
