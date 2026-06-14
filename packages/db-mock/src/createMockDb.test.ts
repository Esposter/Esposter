import { SNAPSHOT_FILENAME } from "@/constants";
import { createMockDb } from "@/createMockDb";
import { PGlite } from "@electric-sql/pglite";
import { messageSchema, schema, users } from "@esposter/db-schema";
import { generateDrizzleJson, generateMigration } from "drizzle-kit/api-postgres";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const introspectQuery = `
  SELECT table_schema, table_name, column_name, udt_name, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  ORDER BY table_schema, table_name, ordinal_position
`;

const introspect = async (client: PGlite) => (await client.query(introspectQuery)).rows;

describe(createMockDb, () => {
  test("snapshot matches a freshly generated migration", { timeout: 60_000 }, async () => {
    expect.hasAssertions();

    const fresh = new PGlite();
    await fresh.exec(`CREATE SCHEMA "${messageSchema.schemaName}"`);
    const previousJson = await generateDrizzleJson({});
    const statements = await generateMigration(previousJson, await generateDrizzleJson(schema, previousJson.id));
    for (const statement of statements) await fresh.exec(statement);

    const snapshot = new PGlite({
      loadDataDir: new Blob([await readFile(join(import.meta.dirname, SNAPSHOT_FILENAME))]),
    });

    await expect(introspect(snapshot)).resolves.toStrictEqual(await introspect(fresh));
  });

  test("returns a queryable db", async () => {
    expect.hasAssertions();

    const db = await createMockDb();

    await expect(db.$count(users)).resolves.toBe(0);
  });
});
