import type { Database } from "@esposter/db-schema";

import { deleteAccountOwnedResources } from "#src/services/account/deleteAccountOwnedResources";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { getContentBlobName } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { StorageBucket, resourcesInResource, ResourceType, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));
vi.mock(
  import("#src/services/streams/getStreamTableClient"),
  () => import("#src/services/streams/getStreamTableClient.test"),
);
vi.mock(import("#src/services/server/publishToServer"), () => import("#src/services/server/publishToServer.test"));

describe(deleteAccountOwnedResources, () => {
  const name = "name";

  beforeAll(async () => {
    mockDb = await createMockDb();
    await openMockBuckets([StorageBucket.ResourceAssets]);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await clearMockBuckets();
    MockTableDatabase.clear();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("purges an owned resource's directory and row, and no other owner's resource", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
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
    await seedBlob(StorageBucket.ResourceAssets, getContentBlobName(ownedResource.id));
    await seedBlob(StorageBucket.ResourceAssets, getContentBlobName(otherResource.id));

    await deleteAccountOwnedResources(userId);

    await expect(readBlobNames(StorageBucket.ResourceAssets)).resolves.toStrictEqual([
      getContentBlobName(otherResource.id),
    ]);
    await expect(mockDb.select({ id: resourcesInResource.id }).from(resourcesInResource)).resolves.toStrictEqual([
      { id: otherResource.id },
    ]);
  });
});
