import type { MockDatabase } from "#src/models/MockDatabase";

import { createMockDb } from "#src/createMockDb";
import { accountsInAuth, StorageBucket, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

describe(createMockDb, () => {
  let mockDatabase: MockDatabase;

  const insertUser = async (userId: string) => {
    await mockDatabase.db
      .insert(usersInAuth)
      .values({ email: `${userId}@example.com`, emailVerified: false, id: userId, name: userId });
  };

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  afterEach(async () => {
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  // An account is a credential the user row owns, so the user row's deletion must take it along rather than
  // Be blocked by it — the account deletion sweep relies on this and deletes no account row by hand
  test("deleting a user removes the account rows linked to it", async () => {
    expect.hasAssertions();

    const userId = v7();
    await insertUser(userId);
    await mockDatabase.db
      .insert(accountsInAuth)
      .values({ accountId: userId, id: userId, providerId: "providerId", userId });

    await mockDatabase.db.delete(usersInAuth).where(eq(usersInAuth.id, userId));

    await expect(
      mockDatabase.db.query.accountsInAuth.findMany({ where: { userId: { eq: userId } } }),
    ).resolves.toStrictEqual([]);
  });

  // The version is the database's count of a row's changes: an insert starts it at zero, an update raises it, and an
  // Upsert That updates the existing row raises it too, so a write that names no version still moves it
  test("raises a row's version on each update, from zero on insert and through an upsert's update branch", async () => {
    expect.hasAssertions();

    const userId = v7();
    await insertUser(userId);
    const readVersion = async () =>
      takeOne(
        await mockDatabase.db
          .select({ version: usersInAuth.version })
          .from(usersInAuth)
          .where(eq(usersInAuth.id, userId)),
        0,
      ).version;
    const initialVersion = await readVersion();

    await mockDatabase.db.update(usersInAuth).set({ name: "renamed" }).where(eq(usersInAuth.id, userId));
    const updatedVersion = await readVersion();

    await mockDatabase.db
      .insert(usersInAuth)
      .values({ email: `${userId}@example.com`, emailVerified: false, id: userId, name: "upserted" })
      .onConflictDoUpdate({ set: { name: "upserted" }, target: usersInAuth.id });

    expect([initialVersion, updatedVersion, await readVersion()]).toStrictEqual([0, 1, 2]);
  });

  // A reset is what every test starts from, so it has to empty the full-text table as well: an FTS5 table keeps shadow
  // Tables that a direct delete would corrupt, and the index must still answer after the reset
  test("reset empties every table and bucket, and leaves a full-text table's index working", async () => {
    expect.hasAssertions();

    await insertUser(v7());
    await mockDatabase.coreDatabase.exec("CREATE VIRTUAL TABLE IF NOT EXISTS resetSearch USING fts5(body)");
    await mockDatabase.coreDatabase.prepare("INSERT INTO resetSearch (body) VALUES ('before')").run();
    const bucket = await mockDatabase.getBucket(StorageBucket.ClickerAssets);
    await bucket.put("object", "value");

    await mockDatabase.reset();

    await expect(mockDatabase.db.$count(usersInAuth)).resolves.toBe(0);
    expect((await bucket.list()).objects).toStrictEqual([]);
    const { results: resetResults } = await mockDatabase.coreDatabase.prepare("SELECT body FROM resetSearch").all();
    expect(resetResults).toStrictEqual([]);
    await mockDatabase.coreDatabase.prepare("INSERT INTO resetSearch (body) VALUES ('after')").run();
    const matches = await mockDatabase.coreDatabase
      .prepare("SELECT body FROM resetSearch WHERE resetSearch MATCH 'after'")
      .all<{ body: string }>();
    expect(matches.results).toStrictEqual([{ body: "after" }]);
  });
});
