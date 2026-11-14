import type { MockDatabase } from "@esposter/db-mock";

import { readResourceList } from "#server/services/resource/readResourceList";
import { createMockDb } from "@esposter/db-mock";
import { resourcesInResource, ResourceType, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(readResourceList, () => {
  const userId = v7();
  const otherUserId = v7();
  const limit = 10;
  let mockDatabase: MockDatabase;

  const createResource = async (values: Partial<typeof resourcesInResource.$inferInsert> & { name: string }) => {
    const inserted = await mockDatabase.db
      .insert(resourcesInResource)
      .values({ id: v7(), type: ResourceType.Note, userId, ...values })
      .returning({ id: resourcesInResource.id });
    return takeOne(inserted).id;
  };

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  beforeEach(async () => {
    await mockDatabase.db.insert(usersInAuth).values([
      { email: `${userId}@example.com`, emailVerified: false, id: userId, name: userId },
      { email: `${otherUserId}@example.com`, emailVerified: false, id: otherUserId, name: otherUserId },
    ]);
  });

  afterEach(async () => {
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  test("ranks a name match ahead of a row matched only by its tag", async () => {
    expect.hasAssertions();

    const taggedId = await createResource({ name: "Weekly", tags: { budget: "2026" } });
    const namedId = await createResource({ name: "Budget" });

    const { items } = await readResourceList(mockDatabase.db, userId, { searchQuery: "budget" }, [], limit, 0);

    expect(items.map(({ id }) => id)).toStrictEqual([namedId, taggedId]);
  });

  test("finds the last word as a prefix of what is being typed", async () => {
    expect.hasAssertions();

    const id = await createResource({ name: "Quarterly budgeting" });

    const { items } = await readResourceList(mockDatabase.db, userId, { searchQuery: "quarterly budg" }, [], limit, 0);

    expect(items.map((item) => item.id)).toStrictEqual([id]);
  });

  test("leaves out soft-deleted rows and other owners' rows", async () => {
    expect.hasAssertions();

    const id = await createResource({ name: "Budget" });
    await createResource({ deletedAt: new Date(), name: "Budget" });
    await createResource({ name: "Budget", userId: otherUserId });

    const { items } = await readResourceList(mockDatabase.db, userId, { searchQuery: "budget" }, [], limit, 0);

    expect(items.map((item) => item.id)).toStrictEqual([id]);
  });

  test("follows a rename into the search index and out of the old name", async () => {
    expect.hasAssertions();

    const id = await createResource({ name: "Budget" });
    await mockDatabase.db.update(resourcesInResource).set({ name: "Roadmap" }).where(eq(resourcesInResource.id, id));

    const renamed = await readResourceList(mockDatabase.db, userId, { searchQuery: "roadmap" }, [], limit, 0);
    const stale = await readResourceList(mockDatabase.db, userId, { searchQuery: "budget" }, [], limit, 0);

    expect(renamed.items.map((item) => item.id)).toStrictEqual([id]);
    expect(stale.items).toStrictEqual([]);
  });

  test("a query of punctuation matches nothing instead of failing", async () => {
    expect.hasAssertions();

    await createResource({ name: "Budget" });

    const { items } = await readResourceList(mockDatabase.db, userId, { searchQuery: "%" }, [], limit, 0);

    expect(items).toStrictEqual([]);
  });

  test("a tag filter matches the stored key and value together", async () => {
    expect.hasAssertions();

    const id = await createResource({ name: "A", tags: { status: "open" } });
    await createResource({ name: "B", tags: { status: "closed" } });

    const { items } = await readResourceList(mockDatabase.db, userId, { tags: { status: "open" } }, [], limit, 0);

    expect(items.map((item) => item.id)).toStrictEqual([id]);
  });
});
