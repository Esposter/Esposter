import type { BoundPageSort } from "#src/services/pagination/createPageSort";
import type { MockDatabase } from "@esposter/db-mock";
import type { Database, PageCursor, PageSort, UserInAuth } from "@esposter/db-schema";

import { createUser } from "#src/services/message/createUser.test";
import { createPageSort } from "#src/services/pagination/createPageSort";
import { getPageOrderBy } from "#src/services/pagination/getPageOrderBy";
import { getPageWhere } from "#src/services/pagination/getPageWhere";
import { toPage } from "#src/services/pagination/toPage";
import { createMockDb } from "@esposter/db-mock";
import { createPageInputSchema, SortOrder, usersInAuth } from "@esposter/db-schema";
import { inArray, sql } from "drizzle-orm";
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
  const readPage = async <TKey extends keyof UserInAuth>(bound: BoundPageSort<TKey>, cursor: PageCursor) =>
    toPage(
      await db
        .select()
        .from(usersInAuth)
        .where(getPageWhere(bound, cursor))
        .orderBy(...getPageOrderBy(bound, cursor))
        .limit(limit + 1),
      bound,
      cursor,
      limit,
    );
  // Each page waits on the cursor the one before it answered, so the pages are read one after another. The walk takes
  // The sort it reads, so every list is read by the same walker
  const readAll = async <TKey extends keyof UserInAuth>(
    bound: BoundPageSort<TKey>,
    encodedCursor = "",
  ): Promise<UserInAuth[]> => {
    const cursor = createPageInputSchema(bound).parse({ cursor: encodedCursor, limit }).cursor;
    const page = await readPage(bound, cursor);
    return page.nextCursor ? [...page.items, ...(await readAll(bound, page.nextCursor))] : page.items;
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

    const ids = (await readAll(boundSort)).map(({ id }) => id);

    expect(ids).toStrictEqual(listedIds);
  });

  test("continues after the last item read when items above it are removed", async () => {
    expect.hasAssertions();

    const firstPage = await readPage(boundSort, inputSchema.parse({ limit }).cursor);
    await db.delete(usersInAuth).where(
      inArray(
        usersInAuth.id,
        firstPage.items.map(({ id }) => id),
      ),
    );
    const secondPage = await readPage(boundSort, inputSchema.parse({ cursor: firstPage.nextCursor, limit }).cursor);

    expect(secondPage.items.map(({ id }) => id)).toStrictEqual(listedIds.slice(limit, limit * 2));
  });

  test("reads backward from a cursor, answering the items before it in the list's order", async () => {
    expect.hasAssertions();

    const backwardCursor: PageCursor = { isBackward: true, values: [0, listedIds[2] ?? ""] };
    const page = await readPage(boundSort, backwardCursor);

    expect(page.items.map(({ id }) => id)).toStrictEqual(listedIds.slice(0, limit));
  });

  // An expression key is bound like a column: the cursor carries the folded name's row value, so the order is the
  // Expression's, and "bob" falls between "Alice" and "Carl" where its bytes would put it after both
  test("reads an expression key in the order the expression compares, across page boundaries", async () => {
    expect.hasAssertions();

    const alice = createUser("00000000-0000-7000-8000-000000000013", new Date(0), "Alice");
    const bob = createUser("00000000-0000-7000-8000-000000000012", new Date(0), "bob");
    const carl = createUser("00000000-0000-7000-8000-000000000011", new Date(0), "Carl");
    const dave = createUser("00000000-0000-7000-8000-000000000014", new Date(0), "dave");
    const eve = createUser("00000000-0000-7000-8000-000000000015", new Date(0), "Eve");
    await db.delete(usersInAuth);
    await db.insert(usersInAuth).values([carl, bob, alice, dave, eve]);
    const nameSort = { keys: ["name", "id"], order: SortOrder.Asc } as const satisfies PageSort<"id" | "name">;
    const nameBoundSort = createPageSort(
      { id: usersInAuth.id, name: sql`${usersInAuth.name} collate nocase` },
      nameSort,
    );
    const names = (await readAll(nameBoundSort)).map((item) => item.name);

    expect(names).toStrictEqual(["Alice", "bob", "Carl", "dave", "Eve"]);
  });

  test.each([["not base64 at all!"], [btoa("[]")], [btoa("[false, [0]]")], [btoa("{}")]])(
    "refuses the cursor %s, which the server did not issue for this sort",
    (cursor) => {
      expect.hasAssertions();

      expect(inputSchema.safeParse({ cursor, limit }).success).toBe(false);
    },
  );
});
