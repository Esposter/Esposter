import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { writeSnapshotVersion } from "#server/services/resource/snapshot/writeSnapshotVersion";
import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import {
  AzureContainer,
  resourcesInResource,
  ResourceType,
  resourceVersionAssetsInResource,
  SnapshotChannel,
  storageLedgerInStorage,
  usersInAuth,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockEventGridDatabase } from "azure-mock";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe(writeSnapshotVersion, () => {
  let mockContext: Context;
  let ctx: AuthedContext;
  let resource: ResourceInResource;
  const missingAssetHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
  });

  beforeEach(async () => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    resource = takeOne(
      await mockContext.db
        .insert(resourcesInResource)
        .values({ name: "name", type: ResourceType.Webpage, userId: ctx.getSessionPayload.user.id })
        .returning(),
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    MockEventGridDatabase.clear();
    await mockContext.db.delete(resourcesInResource);
    await mockContext.db.delete(storageLedgerInStorage);
    await mockContext.db.update(usersInAuth).set({ storageBytesUsed: 0 });
  });

  // A publish that read content embedding an image, then lost the image to a file delete, must fail here. The version
  // Row and the reference rows are rolled back with the transaction, and the object is never written
  test("a stored version never names a missing asset", async () => {
    expect.hasAssertions();

    const missingAssetUrl = getResourceAssetUrl(getResourceFileBlobName(resource.id, missingAssetHash));
    const serializedContent = JSON.stringify({ sections: [{ image: missingAssetUrl, type: "image" }] });

    await expect(
      writeSnapshotVersion(
        mockContext.db,
        resource,
        { channel: SnapshotChannel.Published, version: 1 },
        serializedContent,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name: Resource, cannot store content naming a missing asset]`,
    );
    await expect(
      mockContext.db.query.resourceVersionsInResource.findFirst({ where: { resourceId: { eq: resource.id } } }),
    ).resolves.toBeUndefined();
    await expect(mockContext.db.select().from(resourceVersionAssetsInResource)).resolves.toStrictEqual([]);
    expect(MockContainerDatabase.get(AzureContainer.ResourceAssets)?.size ?? 0).toBe(0);
  });
});
