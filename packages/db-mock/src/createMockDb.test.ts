import type { MockDatabase } from "#src/models/MockDatabase";

import { createMockDb } from "#src/createMockDb";
import { StorageBucket, accountsInAuth, usersInAuth } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
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

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  afterEach(async () => {
    await mockDatabase.reset();
  });

  test("returns a queryable db", async () => {
    expect.hasAssertions();

    const count = await mockDatabase.db.$count(usersInAuth);

    expect(count).toBe(0);
  });

  // An account is a credential the user row owns, so the user row's deletion must take it along rather than
  // Be blocked by it — the account deletion sweep relies on this and deletes no account row by hand
  test("deleting a user removes the account rows linked to it", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    await insertUser(userId);
    await mockDatabase.db
      .insert(accountsInAuth)
      .values({ accountId: userId, id: userId, providerId: "providerId", userId });

    await mockDatabase.db.delete(usersInAuth).where(eq(usersInAuth.id, userId));

    await expect(
      mockDatabase.db.query.accountsInAuth.findMany({ where: { userId: { eq: userId } } }),
    ).resolves.toStrictEqual([]);
  });

  // A reset is what every test starts from, so it has to empty the full-text table as well: an FTS5 table keeps shadow
  // Tables that a direct delete would corrupt, and the index must still answer after the reset
  test("reset empties every table and bucket, and leaves a full-text table's index working", async () => {
    expect.hasAssertions();

    await insertUser(crypto.randomUUID());
    await mockDatabase.streamsDb.exec("CREATE VIRTUAL TABLE IF NOT EXISTS resetSearch USING fts5(body)");
    await mockDatabase.streamsDb.prepare("INSERT INTO resetSearch (body) VALUES ('before')").run();
    const bucket = await mockDatabase.getBucket(StorageBucket.ClickerAssets);
    await bucket.put("object", "value");

    await mockDatabase.reset();

    expect(await mockDatabase.db.$count(usersInAuth)).toBe(0);
    expect((await bucket.list()).objects).toStrictEqual([]);
    expect((await mockDatabase.streamsDb.prepare("SELECT body FROM resetSearch").all()).results).toStrictEqual([]);
    await mockDatabase.streamsDb.prepare("INSERT INTO resetSearch (body) VALUES ('after')").run();
    const matches = await mockDatabase.streamsDb
      .prepare("SELECT body FROM resetSearch WHERE resetSearch MATCH 'after'")
      .all<{ body: string }>();
    expect(matches.results).toStrictEqual([{ body: "after" }]);
  });
});
