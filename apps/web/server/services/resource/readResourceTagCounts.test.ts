import type { MockDatabase } from "@esposter/db-mock";

import { readResourceTagCounts } from "#server/services/resource/readResourceTagCounts";
import { createMockDb } from "@esposter/db-mock";
import { resourcesInResource, ResourceType, usersInAuth } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(readResourceTagCounts, () => {
  const userId = v7();
  let mockDatabase: MockDatabase;

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  beforeEach(async () => {
    await mockDatabase.db
      .insert(usersInAuth)
      .values({ email: `${userId}@example.com`, emailVerified: false, id: userId, name: userId });
  });

  afterEach(async () => {
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  test("counts each tag key across the owner's resources, most used first, values not grouped", async () => {
    expect.hasAssertions();

    await mockDatabase.db.insert(resourcesInResource).values([
      { id: v7(), name: "A", tags: { budget: "2026", status: "open" }, type: ResourceType.Note, userId },
      { id: v7(), name: "B", tags: { budget: "2027" }, type: ResourceType.Note, userId },
      { id: v7(), name: "C", tags: { review: "yes" }, type: ResourceType.Note, userId },
    ]);

    const counts = await readResourceTagCounts(mockDatabase.db, userId);

    expect(counts).toStrictEqual([
      { count: 2, name: "budget" },
      { count: 1, name: "review" },
      { count: 1, name: "status" },
    ]);
  });
});
