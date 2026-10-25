import type { Database } from "@esposter/db-schema";

import { createMockDb } from "#src/createMockDb";
import { SNAPSHOT_FILENAME } from "#src/services/constants";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { schema, usersInAuth } from "@esposter/db-schema";
import { generateDrizzleJson, generateMigration } from "drizzle-kit/api-postgres";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vitest";

describe(createMockDb, () => {
  const introspectQuery = `
    SELECT table_schema, table_name, column_name, udt_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name, ordinal_position
  `;

  const introspect = async (client: PGlite) => (await client.query(introspectQuery)).rows;

  let db: Database;
  let migratedIntrospection: Awaited<ReturnType<typeof introspect>>;
  let snapshotIntrospection: Awaited<ReturnType<typeof introspect>>;

  // Both PGlite boots and the replay of every statement are set up here rather than in the test, so they run under
  // The hook timeout a PGlite boot is given, not the per-test one a loaded run starves
  beforeAll(async () => {
    db = await createMockDb();

    const migratedPGlite = new PGlite({ extensions: { pg_trgm } });
    // Mirrors generateSnapshot.ts — the generated DDL includes the resources trigram index,
    // Which cannot be created without pg_trgm installed
    await migratedPGlite.exec("CREATE EXTENSION IF NOT EXISTS pg_trgm");
    const previousJson = await generateDrizzleJson({});
    const statements = await generateMigration(previousJson, await generateDrizzleJson(schema, previousJson.id));
    // oxlint-disable-next-line no-await-in-loop -- Order is the contract: a migration's statements run in the order they were generated
    for (const statement of statements) await migratedPGlite.exec(statement);
    migratedIntrospection = await introspect(migratedPGlite);

    const snapshotPGlite = new PGlite({
      extensions: { pg_trgm },
      loadDataDir: new Blob([await readFile(join(import.meta.dirname, SNAPSHOT_FILENAME))]),
    });
    snapshotIntrospection = await introspect(snapshotPGlite);
  });

  test("snapshot matches a freshly generated migration", () => {
    expect.hasAssertions();

    expect(snapshotIntrospection).toStrictEqual(migratedIntrospection);
  });

  test("returns a queryable db", async () => {
    expect.hasAssertions();

    const count = await db.$count(usersInAuth);

    expect(count).toBe(0);
  });
});
