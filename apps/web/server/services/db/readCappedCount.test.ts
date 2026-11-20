import type { Context } from "#server/trpc/context";

import { readCappedCount } from "#server/services/db/readCappedCount";
import { createMockContext, createMockUser } from "#server/trpc/context.test";
import { usersInAuth } from "@esposter/db-schema";
import { inArray } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe(readCappedCount, () => {
  const cap = 1;
  let mockContext: Context;
  // The context's own user is in the table too, so each count is over the users its test made
  const createUserIds = async (count: number) =>
    Promise.all(Array.from({ length: count }, async () => (await createMockUser(mockContext.db)).id));

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  afterEach(async () => {
    await mockContext.db.delete(usersInAuth);
  });

  test("counts exactly at the cap uncapped", async () => {
    expect.hasAssertions();

    const userIds = await createUserIds(cap);

    await expect(
      readCappedCount(mockContext.db, usersInAuth, inArray(usersInAuth.id, userIds), cap),
    ).resolves.toStrictEqual({ count: cap, isCapped: false });
  });

  test("caps the count beyond the cap", async () => {
    expect.hasAssertions();

    const userIds = await createUserIds(cap + 1);

    await expect(
      readCappedCount(mockContext.db, usersInAuth, inArray(usersInAuth.id, userIds), cap),
    ).resolves.toStrictEqual({ count: cap, isCapped: true });
  });
});
