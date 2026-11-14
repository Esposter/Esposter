import type { Database } from "@esposter/db-schema";

import { deleteAccountOwnedResources } from "#src/services/account/deleteAccountOwnedResources";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { getContentBlobName } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  resourceActivitiesInResource,
  ResourceActivityType,
  resourcesInResource,
  ResourceType,
  StorageBucket,
  usersInAuth,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));

describe(deleteAccountOwnedResources, () => {
  const name = "name";

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([StorageBucket.ResourceAssets]);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await clearMockBuckets();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("purges an owned resource's directory, activity trail and row, and no other owner's resource", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const ownedResource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Note, userId }).returning(),
    );
    const otherResource = takeOne(
      await mockDb
        .insert(resourcesInResource)
        .values({ name, type: ResourceType.Note, userId: otherUserId })
        .returning(),
    );
    // The activity trail is the resource's own rows, so they cascade with its row
    await mockDb.insert(resourceActivitiesInResource).values([
      { activityType: ResourceActivityType.Created, resourceId: ownedResource.id, userId },
      { activityType: ResourceActivityType.Created, resourceId: otherResource.id, userId: otherUserId },
    ]);
    await seedBlob(StorageBucket.ResourceAssets, getContentBlobName(ownedResource.id));
    await seedBlob(StorageBucket.ResourceAssets, getContentBlobName(otherResource.id));

    await deleteAccountOwnedResources(userId);

    await expect(readBlobNames(StorageBucket.ResourceAssets)).resolves.toStrictEqual([
      getContentBlobName(otherResource.id),
    ]);
    await expect(mockDb.select({ id: resourcesInResource.id }).from(resourcesInResource)).resolves.toStrictEqual([
      { id: otherResource.id },
    ]);
    await expect(
      mockDb.select({ resourceId: resourceActivitiesInResource.resourceId }).from(resourceActivitiesInResource),
    ).resolves.toStrictEqual([{ resourceId: otherResource.id }]);
  });
});
