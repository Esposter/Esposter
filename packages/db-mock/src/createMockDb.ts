import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { SNAPSHOT_FILENAME } from "@/constants";
import "@/util/bigintPolyfill";
import { PGlite } from "@electric-sql/pglite";
import { relations } from "@esposter/db-schema";
import { drizzle } from "drizzle-orm/pglite";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
// Loads a pre-migrated data directory snapshot instead of running migrations at runtime.
// This skips PGlite's `initdb` boot + migration generation, cutting ~2.3s per call down to ~0.9s.
// Regenerate the snapshot with `pnpm snapshot:gen` whenever the schema changes.
// The createMockDb.test.ts verification fails if the committed snapshot drifts from the schema.
export const createMockDb = async (): Promise<PostgresJsDatabase<typeof relations>> => {
  const loadDataDir = new Blob([await readFile(join(import.meta.dirname, SNAPSHOT_FILENAME))]);
  const db = drizzle({ client: new PGlite({ loadDataDir }), relations });
  return db as unknown as PostgresJsDatabase<typeof relations>;
};
