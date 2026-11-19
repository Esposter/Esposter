import type { Database } from "@esposter/db-schema";

import { getAccountTopics } from "#src/services/account/getAccountTopics";
import { createUser } from "#src/services/shared/createUser.test";
import { createMockDb } from "@esposter/db-mock";
import {
  bookmarksInApp,
  getTopic,
  resourcesInResource,
  ResourceType,
  TopicKind,
  usersInAuth,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));

describe(getAccountTopics, () => {
  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
  });

  afterEach(async () => {
    await mockDb.delete(usersInAuth);
  });

  test("names the bookmark of each other reader on an owned resource, and the resource itself, once", async () => {
    expect.hasAssertions();

    const userId = v7();
    const readerId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(readerId)]);
    const resource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name: "name", type: ResourceType.Note, userId }).returning(),
    );
    await mockDb
      .insert(bookmarksInApp)
      .values({ path: "/resource", resourceId: resource.id, title: "title", userId: readerId });

    await expect(getAccountTopics(userId)).resolves.toStrictEqual([
      getTopic(TopicKind.Bookmark, readerId),
      getTopic(TopicKind.Resource, resource.id),
      getTopic(TopicKind.Feed, "posts"),
    ]);
  });
});
