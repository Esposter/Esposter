import type { ContainerClient } from "@azure/storage-blob";
import type { Database } from "@esposter/db-schema";

import { cloneContentAssets } from "#server/services/resource/cloneContentAssets";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { createMockDb } from "@esposter/db-mock";
import {
  AzureContainer,
  FILES_DIRECTORY_SEGMENT,
  resourcePublicationsInResource,
  resourcesInResource,
  ResourceType,
  resourceVersionAssetsInResource,
  resourceVersionsInResource,
  SnapshotChannel,
  usersInAuth,
} from "@esposter/db-schema";
import { MockContainerClient, MockContainerDatabase } from "azure-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { containerClientMock } = vi.hoisted(() => ({ containerClientMock: {} as { current: ContainerClient } }));

vi.mock(import("#server/composables/azure/container/useContainerClient"), () => ({
  useContainerClient: () => Promise.resolve(containerClientMock.current),
}));

// The charge every clone makes is asserted where a real database exists, in the duplicate router test, rather than
// Faked into this one
vi.mock(import("@esposter/db"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    chargeAndCopyBlob: (
      _db: Database,
      _userId: string,
      _containerName: AzureContainer,
      containerClient: ContainerClient,
      sourceBlobName: string,
      destinationBlobName: string,
    ) => original.copyBlob(containerClient, sourceBlobName, destinationBlobName),
  };
});

describe(cloneContentAssets, () => {
  const userId = crypto.randomUUID();
  const sourceResourceId = crypto.randomUUID();
  const destinationResourceId = crypto.randomUUID();
  const hash = "a".repeat(64);
  const otherHash = "b".repeat(64);
  const sourceBlobName = `${sourceResourceId}/${FILES_DIRECTORY_SEGMENT}/${hash}`;
  const otherSourceBlobName = `${sourceResourceId}/${FILES_DIRECTORY_SEGMENT}/${otherHash}`;
  const destinationBlobName = `${destinationResourceId}/${FILES_DIRECTORY_SEGMENT}/${hash}`;
  const thirdHash = "c".repeat(64);
  const thirdBlobName = `${sourceResourceId}/${FILES_DIRECTORY_SEGMENT}/${thirdHash}`;
  const publishVersion = 1;
  // Three assets of one resource, the shape where a per-url query multiplies
  const threeAssetContent = {
    html: [sourceBlobName, otherSourceBlobName, thirdBlobName]
      .map((blobName) => `<img src="${getResourceAssetUrl(blobName)}">`)
      .join(""),
  };
  const threeDestinationBlobNames = [hash, otherHash, thirdHash]
    .map((assetHash) => `${destinationResourceId}/${FILES_DIRECTORY_SEGMENT}/${assetHash}`)
    .toSorted();
  // The clone asks the same question the serving endpoint does, so the rows that answer it are what a case varies: an
  // Owned working copy is readable to its owner, and an unowned one is readable to nobody
  const createDatabase = (isOwned: boolean) =>
    ({
      query: {
        resourcePublicationsInResource: { findFirst: () => Promise.resolve(undefined) },
        resourcesInResource: { findFirst: () => Promise.resolve(isOwned ? { id: sourceResourceId } : undefined) },
        // The clone announces the owner's new total once it is done, and reads it from here to do so
        usersInAuth: { findFirst: () => Promise.resolve(undefined) },
      },
    }) as unknown as Database;
  let containerClient: MockContainerClient;

  beforeEach(async () => {
    containerClient = new MockContainerClient("", AzureContainer.ResourceAssets);
    containerClientMock.current = containerClient as unknown as ContainerClient;
    await Promise.all(
      [sourceBlobName, otherSourceBlobName, thirdBlobName].map((blobName) =>
        containerClient.getBlockBlobClient(blobName).upload(blobName, 1),
      ),
    );
  });

  afterEach(() => {
    MockContainerDatabase.clear();
    vi.restoreAllMocks();
  });

  const getBlobNames = async (prefix: string) => {
    const blobNames: string[] = [];
    for await (const { name } of containerClient.listBlobsFlat({ prefix })) blobNames.push(name);
    return blobNames;
  };

  test("duplicating a document copies its images to the new resource", async () => {
    expect.hasAssertions();

    const content = { html: `<img src="${getResourceAssetUrl(sourceBlobName)}">` };
    const clonedContent = await cloneContentAssets(createDatabase(true), userId, content, destinationResourceId);

    await expect(getBlobNames(`${destinationResourceId}/`)).resolves.toStrictEqual([destinationBlobName]);
    expect(clonedContent).toStrictEqual({ html: `<img src="${getResourceAssetUrl(destinationBlobName)}">` });
  });

  // Content naming one image twice has one object to copy, and both references follow it to the destination
  test("copies an image named twice once and rewrites both references", async () => {
    expect.hasAssertions();

    const url = getResourceAssetUrl(sourceBlobName);
    const content = { html: `<img src="${url}"><img src="${url}">` };
    const clonedContent = await cloneContentAssets(createDatabase(true), userId, content, destinationResourceId);

    await expect(getBlobNames(`${destinationResourceId}/`)).resolves.toStrictEqual([destinationBlobName]);
    expect(clonedContent).toStrictEqual({
      html: `<img src="${getResourceAssetUrl(destinationBlobName)}"><img src="${getResourceAssetUrl(destinationBlobName)}">`,
    });
  });

  // A destination that already holds the hash holds the same bytes, so the copy is skipped and the url still follows it
  test("skips the copy when the destination already holds the hash", async () => {
    expect.hasAssertions();

    await containerClient.getBlockBlobClient(destinationBlobName).upload(destinationBlobName, 1);
    const content = { html: `<img src="${getResourceAssetUrl(sourceBlobName)}">` };
    const clonedContent = await cloneContentAssets(createDatabase(true), userId, content, destinationResourceId);

    await expect(getBlobNames(`${destinationResourceId}/`)).resolves.toStrictEqual([destinationBlobName]);
    expect(clonedContent).toStrictEqual({ html: `<img src="${getResourceAssetUrl(destinationBlobName)}">` });
  });

  // The copy path repeats the authorization the read path enforces: a working-copy url the caller cannot open reaches
  // Them easily, and copying it would republish someone else's private blob under a directory that answers to anyone
  test("carries a url the caller may not read verbatim instead of copying its blob", async () => {
    expect.hasAssertions();

    const content = { html: `<img src="${getResourceAssetUrl(sourceBlobName)}">` };
    const clonedContent = await cloneContentAssets(createDatabase(false), userId, content, destinationResourceId);

    await expect(getBlobNames(`${destinationResourceId}/`)).resolves.toStrictEqual([]);
    expect(clonedContent).toStrictEqual({ html: `<img src="${getResourceAssetUrl(sourceBlobName)}">` });
  });

  test("copies each distinct hash to its own destination address", async () => {
    expect.hasAssertions();

    const content = {
      html: `<img src="${getResourceAssetUrl(sourceBlobName)}"><img src="${getResourceAssetUrl(otherSourceBlobName)}">`,
    };
    await cloneContentAssets(createDatabase(true), userId, content, destinationResourceId);

    expect((await getBlobNames(`${destinationResourceId}/`)).toSorted()).toStrictEqual(
      [destinationBlobName, `${destinationResourceId}/${FILES_DIRECTORY_SEGMENT}/${otherHash}`].toSorted(),
    );
  });

  // The rows the readability answer reads, in a real database, so the counts below are the queries production runs
  const createSeededDatabase = async ({ isPublished, ownerId }: { isPublished: boolean; ownerId: string }) => {
    const db = await createMockDb();
    const createdAt = new Date(0);
    await db
      .insert(usersInAuth)
      .values({
        biography: "",
        createdAt,
        email: "email",
        emailVerified: true,
        id: ownerId,
        name: "name",
        updatedAt: createdAt,
      });
    await db
      .insert(resourcesInResource)
      .values({ id: sourceResourceId, name: "name", type: ResourceType.Webpage, userId: ownerId });
    if (isPublished) {
      await db
        .insert(resourceVersionsInResource)
        .values({
          channel: SnapshotChannel.Published,
          hash: "",
          plaintextBytes: 0,
          resourceId: sourceResourceId,
          storedBytes: 0,
          version: publishVersion,
        });
      await db.insert(resourcePublicationsInResource).values({ publishVersion, resourceId: sourceResourceId });
      await db
        .insert(resourceVersionAssetsInResource)
        .values(
          [hash, otherHash, thirdHash].map((assetHash) => ({
            assetHash,
            channel: SnapshotChannel.Published,
            resourceId: sourceResourceId,
            version: publishVersion,
          })),
        );
    }
    return db;
  };

  test("asks ownership once for a resource its caller owns, however many of its assets it copies", async () => {
    expect.hasAssertions();

    const db = await createSeededDatabase({ isPublished: false, ownerId: userId });
    const findFirstResource = vi.spyOn(db.query.resourcesInResource, "findFirst");
    const findFirstPublication = vi.spyOn(db.query.resourcePublicationsInResource, "findFirst");
    const findFirstPublishedAsset = vi.spyOn(db.query.resourceVersionAssetsInResource, "findFirst");

    await cloneContentAssets(db, userId, threeAssetContent, destinationResourceId);

    expect(findFirstResource).toHaveBeenCalledTimes(1);
    expect(findFirstPublication).not.toHaveBeenCalled();
    expect(findFirstPublishedAsset).not.toHaveBeenCalled();
    expect((await getBlobNames(`${destinationResourceId}/`)).toSorted()).toStrictEqual(threeDestinationBlobNames);
  });

  test("asks ownership and publication once each for a published resource a stranger clones, and the published lookup once per asset", async () => {
    expect.hasAssertions();

    const db = await createSeededDatabase({ isPublished: true, ownerId: crypto.randomUUID() });
    const findFirstResource = vi.spyOn(db.query.resourcesInResource, "findFirst");
    const findFirstPublication = vi.spyOn(db.query.resourcePublicationsInResource, "findFirst");
    const findFirstPublishedAsset = vi.spyOn(db.query.resourceVersionAssetsInResource, "findFirst");

    await cloneContentAssets(db, userId, threeAssetContent, destinationResourceId);

    expect(findFirstResource).toHaveBeenCalledTimes(1);
    expect(findFirstPublication).toHaveBeenCalledTimes(1);
    expect(findFirstPublishedAsset).toHaveBeenCalledTimes(3);
    expect((await getBlobNames(`${destinationResourceId}/`)).toSorted()).toStrictEqual(threeDestinationBlobNames);
  });
});
