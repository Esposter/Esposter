import { MockPublishedTopics } from "#src/services/realtime/publishTopics.test";
import { getDb, runUnit } from "#src/services/shared/db";
import { createMockDb } from "@esposter/db-mock";
import { getTableTopic, usersInAuth } from "@esposter/db-schema";
import { eq, getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

const authTableTopic = getTableTopic(getTableName(usersInAuth));

describe("runUnit", () => {
  beforeAll(async () => {
    await createMockDb();
  });

  beforeEach(() => {
    MockPublishedTopics.length = 0;
  });

  test("a write in a unit publishes the table-wide topic of the table it changed", async () => {
    expect.hasAssertions();

    await runUnit(() => getDb().update(usersInAuth).set({ name: "a" }).where(eq(usersInAuth.id, v7())));

    expect(MockPublishedTopics).toContain(authTableTopic);
  });

  test("a unit that fails still publishes the writes that landed before it failed", async () => {
    expect.hasAssertions();

    await expect(
      runUnit(async () => {
        await getDb().update(usersInAuth).set({ name: "a" }).where(eq(usersInAuth.id, v7()));
        throw new Error("a");
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: a]`);

    expect(MockPublishedTopics).toContain(authTableTopic);
  });

  test("a write outside a unit publishes nothing", async () => {
    expect.hasAssertions();

    await getDb().update(usersInAuth).set({ name: "a" }).where(eq(usersInAuth.id, v7()));

    expect(MockPublishedTopics).toStrictEqual([]);
  });
});
