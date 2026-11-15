import type { MockDatabase } from "@esposter/db-mock";
import type { Database, PageCursor, PageSort, UserInAuth } from "@esposter/db-schema";

import { createUser } from "#src/services/message/createUser.test";
import { createPageSort } from "#src/services/pagination/createPageSort";
import { getPageOrderBy } from "#src/services/pagination/getPageOrderBy";
import { getPageWhere } from "#src/services/pagination/getPageWhere";
import { toPage } from "#src/services/pagination/toPage";
import { createMockDb } from "@esposter/db-mock";
import { createPageInputSchema, SortOrder, usersInAuth } from "@esposter/db-schema";
import { inArray } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(getPageWhere, () => {
  let db: Database;
  let mockDatabase: MockDatabase;
  const name = "name";
  // Five users in two ties on their creation time, so every page boundary below falls inside a tie
  const userIds = [
    "00000000-0000-7000-8000-000000000001",
    "00000000-0000-7000-8000-000000000002",
    "00000000-0000-7000-8000-000000000003",
    "00000000-0000-7000-8000-000000000004",
    "00000000-0000-7000-8000-000000000005",
  ];
  const createdAts = [new Date(0), new Date(0), new Date(0), new Date(1), new Date(1)];
  const sort = { keys: ["createdAt", "id"], order: SortOrder.Desc } as const satisfies PageSort<keyof UserInAuth>;
  const boundSort = createPageSort({ createdAt: usersInAuth.createdAt, id: usersInAuth.id }, sort);
  const inputSchema = createPageInputSchema(sort);
  const limit = 2;
  // The list newest first, ties broken by the larger id first
  const listedIds = [userIds[4], userIds[3], userIds[2], userIds[1], userIds[0]];
  const readPage = async (cursor: PageCursor) =>
    toPage(
      await db
        .select()
        .from(usersInAuth)
        .where(getPageWhere(boundSort, cursor))
        .orderBy(...getPageOrderBy(boundSort, cursor))
        .limit(limit + 1),
      sort,
      cursor,
      limit,
    );
  const readAllIds = async () => {
    const ids: string[] = [];
    let encodedCursor = "";
    do {
      const page = await readPage(inputSchema.parse({ cursor: encodedCursor, limit }).cursor);
      ids.push(...page.items.map(({ id }) => id));
      encodedCursor = page.nextCursor;
    } while (encodedCursor);
    return ids;
  };

  beforeAll(async () => {
    mockDatabase = await createMockDb();
    db = mockDatabase.db;
  });

  beforeEach(async () => {
    await db.delete(usersInAuth);
    await db
      .insert(usersInAuth)
      .values(userIds.map((id, index) => createUser(id, createdAts[index] ?? new Date(0), name)));
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  test("reads every item exactly once, in order, across ties at the page boundaries, and ends on an empty cursor", async () => {
    expect.hasAssertions();

    await expect(readAllIds()).resolves.toStrictEqual(listedIds);
  });

  test("continues after the last item read when items above it are removed", async () => {
    expect.hasAssertions();

    const firstPage = await readPage(inputSchema.parse({ limit }).cursor);
    await db.delete(usersInAuth).where(
      inArray(
        usersInAuth.id,
        firstPage.items.map(({ id }) => id),
      ),
    );
    const secondPage = await readPage(inputSchema.parse({ cursor: firstPage.nextCursor, limit }).cursor);

    expect(secondPage.items.map(({ id }) => id)).toStrictEqual(listedIds.slice(limit, limit * 2));
  });

  test("reads backward from a cursor, answering the items before it in the list's order", async () => {
    expect.hasAssertions();

    const backwardCursor: PageCursor = { isBackward: true, values: [0, listedIds[2] ?? ""] };
    const page = await readPage(backwardCursor);

    expect(page.items.map(({ id }) => id)).toStrictEqual(listedIds.slice(0, limit));
  });

  test.each([["not base64 at all!"], [btoa("[]")], [btoa("[false, [0]]")], [btoa("{}")]])(
    "refuses the cursor %s, which the server did not issue for this sort",
    (cursor) => {
      expect.hasAssertions();

      expect(inputSchema.safeParse({ cursor, limit }).success).toBe(false);
    },
  );
});
