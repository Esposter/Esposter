import type { SQLInputValue } from "node:sqlite";

import { jsonDateParse } from "@esposter/shared";
import { DatabaseSync } from "node:sqlite";
import { describe, vi } from "vitest";

// A socket the runtime accepted: the close and send calls the object makes are the ones a test reads, and its attachment is
// Held as the runtime holds it across hibernation
export const createSocket = () => {
  let attachment: unknown;
  return {
    close: vi.fn<(code: number, reason: string) => void>(),
    deserializeAttachment: () => attachment,
    send: vi.fn<(frame: string) => void>(),
    serializeAttachment: (value: unknown) => {
      attachment = value;
    },
  };
};

export type MockSocket = ReturnType<typeof createSocket>;

// Each frame a socket was sent, read back as the object wrote it
export const readFrames = (socket: MockSocket) => socket.send.mock.calls.map(([frame]) => jsonDateParse(frame));

// The rows of a statement as the driver reads them: one at a time, whole, or as arrays of column values
const createCursor = (rows: unknown[]) => {
  const iterator = rows[Symbol.iterator]();
  return { next: () => iterator.next(), toArray: () => rows };
};

// The state an object runs on. The SQLite is a real in-memory database.
// The socket registry answers getWebSockets and getTags as the runtime does.
// So a second object over the same state reads back the first's writes.
// A closed socket leaves the registry, so a close handler sees only the sockets still open.
// The alarm and the key-value storage are held as the runtime holds them, and deleteAll starts both again empty
export const createMockObjectState = (name: string) => {
  let database = new DatabaseSync(":memory:");
  const keyValues = new Map<string, unknown>();
  const socketTags = new Map<MockSocket, string[]>();
  let pendingWork: Promise<unknown>[] = [];
  let alarm: null | number = null;
  const ctx = {
    acceptWebSocket: (socket: MockSocket, tags: string[]) => {
      socketTags.set(socket, tags);
      socket.close.mockImplementation(() => {
        socketTags.delete(socket);
      });
    },
    blockConcurrencyWhile: <T>(closure: () => Promise<T>) => closure(),
    getTags: (socket: MockSocket) => socketTags.get(socket) ?? [],
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

// The placeholder a helper-only test file needs, since the suites of the objects it stands in for read its state
describe.todo("createMockObjectState");
