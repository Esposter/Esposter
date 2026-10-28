import type { Database } from "@esposter/db-schema";

import { createMockDb } from "#src/createMockDb";
import { SNAPSHOT_FILENAME } from "#src/services/constants";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { accountsInAuth, dataExportsInUser, DataExportStatus, schema, usersInAuth } from "@esposter/db-schema";
import { generateDrizzleJson, generateMigration } from "drizzle-kit/api-postgres";
import { eq } from "drizzle-orm";
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
    await migratedPGlite.exec(statements.join("\n"));
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

  // An account is a credential the user row owns, so the user row's deletion must take it along rather than
  // Be blocked by it — the account deletion sweep relies on this and deletes no account row by hand
  test("deleting a user removes the account rows linked to it", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    await db
      .insert(usersInAuth)
      .values({ email: `${userId}@example.com`, emailVerified: false, id: userId, name: userId });
    await db.insert(accountsInAuth).values({ accountId: userId, id: userId, providerId: "credential", userId });

    await db.delete(usersInAuth).where(eq(usersInAuth.id, userId));

    await expect(db.query.accountsInAuth.findMany({ where: { userId: { eq: userId } } })).resolves.toStrictEqual([]);
  });

  // A person has one export in flight at a time: the partial unique index refuses a second queued or building row for
  // The same user, so a repeated request cannot start a second archive build
  test("a second active data export for one user is refused", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    await db
      .insert(usersInAuth)
      .values({ email: `${userId}@example.com`, emailVerified: false, id: userId, name: userId });
    await db.insert(dataExportsInUser).values({ status: DataExportStatus.Queued, userId });

    await expect(
      db.insert(dataExportsInUser).values({ status: DataExportStatus.Building, userId }),
    ).rejects.toMatchObject({ cause: { code: "23505", constraint: "dataExports_userId_status_unique" } });
  });
});
