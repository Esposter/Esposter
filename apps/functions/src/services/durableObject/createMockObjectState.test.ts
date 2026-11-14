import type { SQLInputValue } from "node:sqlite";

import { DatabaseSync } from "node:sqlite";
import { describe, vi } from "vitest";

// A socket the runtime accepted: the two calls the object makes on one are the ones a test reads
export const createSocket = () => ({
  close: vi.fn<(code: number, reason: string) => void>(),
  send: vi.fn<(frame: string) => void>(),
});

export type MockSocket = ReturnType<typeof createSocket>;

// Each frame a socket was sent, read back as the object wrote it
export const readFrames = (socket: MockSocket) => socket.send.mock.calls.map(([frame]) => JSON.parse(frame));

// The rows of a statement as the driver reads them: one at a time, whole, or as arrays of column values
const createCursor = (rows: unknown[]) => {
  const iterator = rows[Symbol.iterator]();
  return { next: () => iterator.next(), toArray: () => rows };
};

// The state an object runs on. The SQLite is a real in-memory database, and the socket registry answers getWebSockets and
// getTags as the runtime does, so a second object over the same state reads back the first's writes. The alarm is held
// as the runtime holds it, and deleteAll starts the database again empty
export const createMockObjectState = (name: string) => {
  let database = new DatabaseSync(":memory:");
  const socketTags = new Map<MockSocket, string[]>();
  let alarm: number | null = null;
  const ctx = {
    acceptWebSocket: (socket: MockSocket, tags: string[]) => {
      socketTags.set(socket, tags);
    },
    blockConcurrencyWhile: <T>(closure: () => Promise<T>) => closure(),
    getTags: (socket: MockSocket) => socketTags.get(socket) ?? [],
    getWebSockets: (tag?: string) =>
      [...socketTags].filter(([, tags]) => tag === undefined || tags.includes(tag)).map(([socket]) => socket),
    id: { name },
    storage: {
      deleteAlarm: async () => {
        alarm = null;
      },
      deleteAll: async () => {
        database = new DatabaseSync(":memory:");
        alarm = null;
      },
      getAlarm: async () => alarm,
      setAlarm: async (time: number) => {
        alarm = time;
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
  };
  return {
    ctx,
    get database() {
      return database;
    },
  };
};

export type MockObjectState = ReturnType<typeof createMockObjectState>;

// The placeholder a helper-only test file needs, since the suites of the objects it stands in for read its state
describe.todo("createMockObjectState");
