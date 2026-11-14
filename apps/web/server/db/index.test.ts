import type { db as realDb } from "#server/db";
import type { Database } from "@esposter/db-schema";

import { relations } from "@esposter/db-schema";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { describe } from "vitest";

// The production `db` is drizzle over the Worker's core binding, made when its module loads. A test's binding arrives with
// `createMockDb`, which runs after the modules importing `db` have loaded, so this double makes the drizzle instance on first
// Use and remakes it when the binding changes. Every access reads the file's own Miniflare binding
let current: undefined | { binding: typeof env.CORE; database: Database };
const getDatabase = (): Database => {
  if (current?.binding === env.CORE) return current.database;
  const database = drizzle(env.CORE, { relations });
  current = { binding: env.CORE, database };
  return database;
};

export const db = new Proxy({} as typeof realDb, {
  get: (_target, property) => {
    const database = getDatabase();
    const value: unknown = Reflect.get(database, property);
    return typeof value === "function" ? value.bind(database) : value;
  },
});

describe.todo("db");
