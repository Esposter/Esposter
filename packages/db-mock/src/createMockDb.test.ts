import type { Database } from "@esposter/db-schema";

import { SNAPSHOT_FILENAME } from "#src/constants";
import { createMockDb } from "#src/createMockDb";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { messageSchema, schema, users } from "@esposter/db-schema";
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

  beforeAll(async () => {
    db = await createMockDb();
  });

  test("snapshot matches a freshly generated migration", { timeout: 60_000 }, async () => {
    expect.hasAssertions();

    const migratedPGlite = new PGlite({ extensions: { pg_trgm } });
    await migratedPGlite.exec(`CREATE SCHEMA "${messageSchema.schemaName}"`);
    // Mirrors generateSnapshot.ts — the generated DDL includes the resources trigram index,
    // Which cannot be created without pg_trgm installed
    await migratedPGlite.exec("CREATE EXTENSION IF NOT EXISTS pg_trgm");
    const previousJson = await generateDrizzleJson({});
    const statements = await generateMigration(previousJson, await generateDrizzleJson(schema, previousJson.id));
    for (const statement of statements) await migratedPGlite.exec(statement);

    const snapshotPGlite = new PGlite({
      extensions: { pg_trgm },
      loadDataDir: new Blob([await readFile(join(import.meta.dirname, SNAPSHOT_FILENAME))]),
    });

    const snapshotIntrospection = await introspect(snapshotPGlite);

    expect(snapshotIntrospection).toStrictEqual(await introspect(migratedPGlite));
  });

  test("returns a queryable db", async () => {
    expect.hasAssertions();

    const count = await db.$count(users);

    expect(count).toBe(0);
  });
});
