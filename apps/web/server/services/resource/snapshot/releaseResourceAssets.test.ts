import type { AuthedContext } from "#server/models/auth/AuthedContext";
import type { Context } from "#server/trpc/context";
import type { ResourceInResource } from "@esposter/db-schema";

import { useContainerClient } from "#server/composables/azure/container/useContainerClient";
import { deleteSnapshotVersions } from "#server/services/resource/snapshot/deleteSnapshotVersions";
import { releaseResourceAssets } from "#server/services/resource/snapshot/releaseResourceAssets";
import { writeSnapshotVersion } from "#server/services/resource/snapshot/writeSnapshotVersion";
import { createMockContext, getMockSession } from "#server/trpc/context.test";
import { ASSET_DECISION_CLOCK_MARGIN_MS, ASSET_GRACE_MS } from "#shared/services/resource/constants";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { getResourceFileBlobName } from "#shared/services/resource/getResourceFileBlobName";
import { noop, takeOne } from "@esposter/shared";
import {
  AzureContainer,
  resourcesInResource,
  ResourceType,
  resourceVersionAssetsInResource,
  resourceVersionsInResource,
  resourceWorkingAssetsInResource,
  SnapshotChannel,
  SnapshotReason,
  storageLedgerInStorage,
  usersInAuth,
} from "@esposter/db-schema";
import { MockContainerDatabase, MockEventGridDatabase } from "azure-mock";
import { and, eq } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The collection flag is a constant, so the suite reads it through a getter the tests move: counting-only is the value
// Production ships, and the collecting scenarios turn it on for themselves
const { collectionState } = vi.hoisted(() => ({ collectionState: { isEnabled: false } }));

vi.mock(import("#shared/services/resource/constants"), async (importOriginal) => ({
  ...(await importOriginal()),
  isAssetCollectionEnabled: () => collectionState.isEnabled,
}));

describe(releaseResourceAssets, () => {
  let mockContext: Context;
  let ctx: AuthedContext;
  let resource: ResourceInResource;
  const assetHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
  const otherAssetHash = "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae";
  const assetBytes = new Uint8Array(1);
  const getAssetUrl = (hash: string) => getResourceAssetUrl(getResourceFileBlobName(resource.id, hash));
  const getAssetContent = (...hashes: string[]) =>
    JSON.stringify({ sections: hashes.map((hash) => ({ image: getAssetUrl(hash), type: "image" })) });
  const writeVersion = (version: number, serializedContent: string) =>
    writeSnapshotVersion(
      mockContext.db,
      resource,
      { channel: SnapshotChannel.Revisions, reason: SnapshotReason.BeforeImport, version },
      serializedContent,
    );
  // Uploaded at the moment the clock reads, which is what a re-upload stamps onto the blob
  const uploadAsset = async (hash: string) => {
    const containerClient = await useContainerClient(AzureContainer.ResourceAssets);
    await containerClient
      .getBlockBlobClient(getResourceFileBlobName(resource.id, hash))
      .upload(assetBytes, assetBytes.byteLength);
  };
  const deleteVersion = (version: number) =>
    mockContext.db.transaction((tx) =>
      deleteSnapshotVersions(
        tx,
        resource.id,
        and(
          eq(resourceVersionsInResource.resourceId, resource.id),
          eq(resourceVersionsInResource.channel, SnapshotChannel.Revisions),
          eq(resourceVersionsInResource.version, version),
        ),
      ),
    );
  const readAssetHashes = () =>
    mockContext.db
      .select({ assetHash: resourceVersionAssetsInResource.assetHash })
      .from(resourceVersionAssetsInResource)
      .where(eq(resourceVersionAssetsInResource.resourceId, resource.id));

  beforeAll(async () => {
    mockContext = await createMockContext();
    ctx = { ...mockContext, getSessionPayload: getMockSession() };
  });

  beforeEach(async () => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    collectionState.isEnabled = false;
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

  test("an asset embedded in a stored version is kept while the version lives", async () => {
    expect.hasAssertions();

    collectionState.isEnabled = true;
    await uploadAsset(assetHash);
    await writeVersion(1, getAssetContent(assetHash));
    vi.setSystemTime(ASSET_GRACE_MS);

    await releaseResourceAssets(mockContext.db, resource.id, [assetHash]);

    expect(MockEventGridDatabase.get("")).toBeUndefined();
    await expect(readAssetHashes()).resolves.toStrictEqual([{ assetHash }]);
  });

  test("collecting one version keeps an asset another version uses", async () => {
    expect.hasAssertions();

    collectionState.isEnabled = true;
    await uploadAsset(assetHash);
    await writeVersion(1, getAssetContent(assetHash));
    await writeVersion(2, getAssetContent(assetHash));
    const { assetHashes } = await deleteVersion(1);
    vi.setSystemTime(ASSET_GRACE_MS);

    await releaseResourceAssets(mockContext.db, resource.id, assetHashes);

    expect(MockEventGridDatabase.get("")).toBeUndefined();
  });

  test("an asset the working copy names is kept", async () => {
    expect.hasAssertions();

    collectionState.isEnabled = true;
    await uploadAsset(assetHash);
    await mockContext.db.insert(resourceWorkingAssetsInResource).values({ assetHash, resourceId: resource.id });
    vi.setSystemTime(ASSET_GRACE_MS);

    await releaseResourceAssets(mockContext.db, resource.id, [assetHash]);

    expect(MockEventGridDatabase.get("")).toBeUndefined();
  });

  // The deletion is published to the handler that deletes the blob and releases its ledger entry, which is where the
  // Owner's storage usage falls
  test("collecting the last reference deletes the asset and credits the owner", async () => {
    expect.hasAssertions();

    collectionState.isEnabled = true;
    await uploadAsset(assetHash);
    await writeVersion(1, getAssetContent(assetHash));
    const { assetHashes } = await deleteVersion(1);
    vi.setSystemTime(ASSET_GRACE_MS);

    await releaseResourceAssets(mockContext.db, resource.id, assetHashes);

    expect(takeOne(MockEventGridDatabase.get("") ?? []).data).toStrictEqual({
      blobNames: [getResourceFileBlobName(resource.id, assetHash)],
      containerName: AzureContainer.ResourceAssets,
      decidedAt: new Date(Date.now() - ASSET_DECISION_CLOCK_MARGIN_MS),
    });
  });

  test("an unreferenced asset stays stored during the counting-only period", async () => {
    expect.hasAssertions();

    await uploadAsset(assetHash);
    vi.setSystemTime(ASSET_GRACE_MS);

    await releaseResourceAssets(mockContext.db, resource.id, [assetHash]);

    expect(MockEventGridDatabase.get("")).toBeUndefined();
    expect(
      MockContainerDatabase.get(AzureContainer.ResourceAssets)?.has(getResourceFileBlobName(resource.id, assetHash)),
    ).toBe(true);
  });

  // An upload that dedupes onto an object touches it, and the save that names it can land a moment later
  test("a re-uploaded asset is kept through the grace window", async () => {
    expect.hasAssertions();

    collectionState.isEnabled = true;
    await uploadAsset(assetHash);

    await releaseResourceAssets(mockContext.db, resource.id, [assetHash]);

    expect(MockEventGridDatabase.get("")).toBeUndefined();
  });

  test("counting-only logs the unreferenced count", async () => {
    expect.hasAssertions();

    const infoSpy = vi.spyOn(console, "info").mockImplementation(noop);
    await uploadAsset(assetHash);
    await uploadAsset(otherAssetHash);
    await writeVersion(1, getAssetContent(assetHash, otherAssetHash));
    const { assetHashes } = await deleteVersion(1);
    vi.setSystemTime(ASSET_GRACE_MS);

    await releaseResourceAssets(mockContext.db, resource.id, assetHashes);

    expect(infoSpy).toHaveBeenCalledWith("unreferenced assets counted", { count: 2, resourceId: resource.id });
    expect(MockEventGridDatabase.get("")).toBeUndefined();
  });
});
