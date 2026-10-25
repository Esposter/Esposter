import type { Database } from "@esposter/db-schema";

import { deleteAccountOwnedResources } from "#src/services/account/deleteAccountOwnedResources";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { createUser } from "#src/services/shared/createUser.test";
import { InvocationContext } from "@azure/functions";
import { getContentBlobName } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, resourcesInResource, ResourceType, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));
vi.mock(import("#src/services/azure/getTableClient"), () => import("#src/services/azure/getTableClient.test"));
vi.mock(
  import("#src/services/azure/getWebPubSubServiceClient"),
  () => import("#src/services/azure/getWebPubSubServiceClient.test"),
);

describe(deleteAccountOwnedResources, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const name = "name";

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockDb.delete(usersInAuth);
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
    await seedBlob(AzureContainer.ResourceAssets, getContentBlobName(ownedResource.id));
    await seedBlob(AzureContainer.ResourceAssets, getContentBlobName(otherResource.id));

    await deleteAccountOwnedResources(context, userId);

    expect(readBlobNames(AzureContainer.ResourceAssets)).toStrictEqual([getContentBlobName(otherResource.id)]);
    await expect(mockDb.select({ id: resourcesInResource.id }).from(resourcesInResource)).resolves.toStrictEqual([
      { id: otherResource.id },
    ]);
  });
});
