import { getMockPublishedTopics, MockPublishedTopics } from "#src/services/realtime/publishTopics.test";
import { getDb } from "#src/services/shared/getDb";
import { runUnit } from "#src/services/shared/runUnit";
import { getBucket } from "#src/services/storage/getBucket";
import { createMockDb } from "@esposter/db-mock";
import { createUser } from "@esposter/db-mock/workers";
import { getTableTopic, StorageBucket, usersInAuth } from "@esposter/db-schema";
import { env } from "cloudflare:workers";
import { eq, getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

// An update returns the rows its where matches, and a unit names only the rows that changed, so a write needs a row to change
const insertUser = async () => {
  const userId = v7();
  await getDb().insert(usersInAuth).values(createUser(userId));
  return userId;
};

describe(runUnit, () => {
  const authTableTopic = getTableTopic(getTableName(usersInAuth));

  beforeAll(async () => {
    await createMockDb();
  });

  beforeEach(() => {
    MockPublishedTopics.length = 0;
  });

  test("a write in a unit publishes the table-wide topic of the table it changed", async () => {
    expect.hasAssertions();

    const userId = await insertUser();
    await runUnit(() => getDb().update(usersInAuth).set({ name: "a" }).where(eq(usersInAuth.id, userId)));

    expect(getMockPublishedTopics()).toContain(authTableTopic);
  });

  // A blob a unit writes is published under its bucket's binding and its key, so a reader of the blob is woken by the unit
  test("a blob a unit writes publishes its bucket's topic for its key", async () => {
    expect.hasAssertions();

    const key = `${v7()}/blob`;
    const { getBucket: getMockBucket } = await createMockDb();
    Object.assign(env, { USER_ASSETS: await getMockBucket(StorageBucket.UserAssets) });
    await runUnit(() => getBucket(StorageBucket.UserAssets).put(key, "a"));

    expect(getMockPublishedTopics()).toContain(`USER_ASSETS:${key}`);
  });

  test("a unit that fails still publishes the writes that landed before it failed", async () => {
    expect.hasAssertions();

    const userId = await insertUser();
    await expect(
      runUnit(async () => {
        await getDb().update(usersInAuth).set({ name: "a" }).where(eq(usersInAuth.id, userId));
        throw new Error("a");
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: a]`);

    expect(getMockPublishedTopics()).toContain(authTableTopic);
  });

  test("a write outside a unit publishes nothing", async () => {
    expect.hasAssertions();

    await getDb().update(usersInAuth).set({ name: "a" }).where(eq(usersInAuth.id, v7()));

    expect(getMockPublishedTopics()).toStrictEqual([]);
  });
});
