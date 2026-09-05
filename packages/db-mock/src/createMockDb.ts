import type { Database } from "@esposter/db-schema";

import { SNAPSHOT_FILENAME } from "#src/constants";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { relations } from "@esposter/db-schema";
import { drizzle } from "drizzle-orm/pglite";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
// The snapshot is immutable, so the read is shared across every call in a worker instead of hitting disk per database
let snapshotPromise: ReturnType<typeof readFile> | undefined;

// Loads a pre-migrated data directory snapshot instead of running migrations at runtime, which skips
// PGlite's `initdb` boot and migration generation and takes well under half the time per call.
// Regenerate the snapshot with `pnpm snapshot:gen` whenever the schema changes.
export const createMockDb = async (): Promise<Database> => {
  snapshotPromise ??= readFile(join(import.meta.dirname, SNAPSHOT_FILENAME));
  const loadDataDir = new Blob([await snapshotPromise]);
  // The snapshot was dumped with pg_trgm installed, so the extension must be loaded here too —
  // Otherwise the resources trigram index and similarity() ranking resolve against nothing.
  const client = new PGlite({ extensions: { pg_trgm }, loadDataDir });
  // `new PGlite()` returns before init finishes, so the first query would otherwise pay the
  // Boot cost and blow past the per-test timeout. Await readiness here so it lands in `beforeAll`.
  await client.waitReady;
  const db = drizzle({ client, relations });
  return db as unknown as Database;
};
