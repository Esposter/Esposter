import type { R2Bucket } from "@cloudflare/workers-types";
import type { Database } from "@esposter/db-schema";

import { cloneContentAssets } from "#server/services/resource/cloneContentAssets";
import { setupMockStorageBucket } from "#server/services/storage/setupMockStorageBucket.test";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { deleteDirectory, listBlobNames } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  FILES_DIRECTORY_SEGMENT,
  resourcePublicationsInResource,
  resourcesInResource,
  ResourceType,
  resourceVersionAssetsInResource,
  resourceVersionsInResource,
  SnapshotChannel,
  StorageBucket,
  usersInAuth,
} from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The charge every clone makes is asserted where a real database exists, in the duplicate router test, rather than
// Faked into this one
vi.mock(import("@esposter/db"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    chargeAndCopyBlob: (
      _db: Database,
      _userId: string,
      _bucketName: StorageBucket,
      bucket: R2Bucket,
      sourceBlobName: string,
      destinationBlobName: string,
    ) => original.copyBlob(bucket, sourceBlobName, destinationBlobName),
  };
});

describe(cloneContentAssets, () => {
  const userId = v7();
  const sourceResourceId = v7();
  const destinationResourceId = v7();
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
  // The owner's copy is answered by its ownership lookup alone, so this stub serves every case that reads an
  // Owned resource. A stranger's copy also reads the publication, which the stub does not serve, so those cases seed
  // The real database
  const createOwnerDatabase = () =>
    ({
      query: {
        resourcesInResource: { findFirst: () => Promise.resolve({ id: sourceResourceId }) },
        // The clone announces the owner's new total once it is done, and reads it from here to do so
        usersInAuth: { findFirst: () => Promise.resolve(undefined) },
      },
    }) as unknown as Database;
  // The rows the readability answer reads, in a real database, so the counts below are the queries production runs
  const createSeededDatabase = async ({ isPublished, ownerId }: { isPublished: boolean; ownerId: string }) => {
    const { db } = await createMockDb();
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
  const { getMockBucket } = setupMockStorageBucket(StorageBucket.ResourceAssets);

  beforeEach(async () => {
    const bucket = getMockBucket();
    await Promise.all(
      [sourceBlobName, otherSourceBlobName, thirdBlobName].map((blobName) => bucket.put(blobName, new Uint8Array(1))),
    );
  });

  afterEach(async () => {
    await deleteDirectory(getMockBucket());
    // Each test seeds the same resource and owner, so the rows the last one wrote are cleared before the next
    await (await createMockDb()).reset();
    vi.restoreAllMocks();
  });

  const getBlobNames = (prefix: string) => listBlobNames(getMockBucket(), prefix);

  test("duplicating a document copies its images to the new resource", async () => {
    expect.hasAssertions();

    const content = { html: `<img src="${getResourceAssetUrl(sourceBlobName)}">` };
    const clonedContent = await cloneContentAssets(
      createOwnerDatabase(),
      userId,
      content,
      sourceResourceId,
      destinationResourceId,
    );

    await expect(getBlobNames(`${destinationResourceId}/`)).resolves.toStrictEqual([destinationBlobName]);
    expect(clonedContent).toStrictEqual({ html: `<img src="${getResourceAssetUrl(destinationBlobName)}">` });
  });

  // Content naming one image twice has one object to copy, and both references follow it to the destination
  test("copies an image named twice once and rewrites both references", async () => {
    expect.hasAssertions();

    const url = getResourceAssetUrl(sourceBlobName);
    const content = { html: `<img src="${url}"><img src="${url}">` };
    const clonedContent = await cloneContentAssets(
      createOwnerDatabase(),
      userId,
      content,
      sourceResourceId,
      destinationResourceId,
    );

    await expect(getBlobNames(`${destinationResourceId}/`)).resolves.toStrictEqual([destinationBlobName]);
    expect(clonedContent).toStrictEqual({
      html: `<img src="${getResourceAssetUrl(destinationBlobName)}"><img src="${getResourceAssetUrl(destinationBlobName)}">`,
    });
  });

  // A destination that already holds the hash holds the same bytes, so the copy is skipped and the url still follows it
  test("skips the copy when the destination already holds the hash", async () => {
    expect.hasAssertions();

    await getMockBucket().put(destinationBlobName, new Uint8Array(1));
    const content = { html: `<img src="${getResourceAssetUrl(sourceBlobName)}">` };
    const clonedContent = await cloneContentAssets(
      createOwnerDatabase(),
      userId,
      content,
      sourceResourceId,
      destinationResourceId,
    );

    await expect(getBlobNames(`${destinationResourceId}/`)).resolves.toStrictEqual([destinationBlobName]);
    expect(clonedContent).toStrictEqual({ html: `<img src="${getResourceAssetUrl(destinationBlobName)}">` });
  });

  // The copy path repeats the authorization the read path enforces: a working-copy url the caller cannot open reaches
  // Them easily, and copying it would republish someone else's private blob under a directory that answers to anyone
  test("carries a url the caller may not read verbatim instead of copying its blob", async () => {
    expect.hasAssertions();

    const content = { html: `<img src="${getResourceAssetUrl(sourceBlobName)}">` };
    const db = await createSeededDatabase({ isPublished: false, ownerId: v7() });
    const clonedContent = await cloneContentAssets(db, userId, content, sourceResourceId, destinationResourceId);

    await expect(getBlobNames(`${destinationResourceId}/`)).resolves.toStrictEqual([]);
    expect(clonedContent).toStrictEqual({ html: `<img src="${getResourceAssetUrl(sourceBlobName)}">` });
  });

  // A whiteboard names its image by the bare hash of its file, with no url for the url scan to find, so the copy must
  // Take the file the element names in the form it is stored
  test("duplicating a whiteboard copies the file its element names by bare id", async () => {
    expect.hasAssertions();

    const content = { elements: [{ fileId: hash }] };
    const clonedContent = await cloneContentAssets(
      createOwnerDatabase(),
      userId,
      content,
      sourceResourceId,
      destinationResourceId,
    );

    await expect(getBlobNames(`${destinationResourceId}/`)).resolves.toStrictEqual([destinationBlobName]);
    expect(clonedContent).toStrictEqual(content);
  });

  test("asks ownership once for a resource its caller owns, however many of its assets it copies", async () => {
    expect.hasAssertions();

    const db = await createSeededDatabase({ isPublished: false, ownerId: userId });
    const findFirstResource = vi.spyOn(db.query.resourcesInResource, "findFirst");
    const select = vi.spyOn(db, "select");
    const findFirstPublishedAsset = vi.spyOn(db.query.resourceVersionAssetsInResource, "findFirst");

    await cloneContentAssets(db, userId, threeAssetContent, sourceResourceId, destinationResourceId);

    expect(findFirstResource).toHaveBeenCalledTimes(1);
    expect(select).not.toHaveBeenCalled();
    expect(findFirstPublishedAsset).not.toHaveBeenCalled();
    expect((await getBlobNames(`${destinationResourceId}/`)).toSorted()).toStrictEqual(threeDestinationBlobNames);
  });

  test("asks ownership and publication once each for a published resource a stranger clones, and the published lookup once per asset", async () => {
    expect.hasAssertions();

    const db = await createSeededDatabase({ isPublished: true, ownerId: v7() });
    const findFirstResource = vi.spyOn(db.query.resourcesInResource, "findFirst");
    const select = vi.spyOn(db, "select");
    const findFirstPublishedAsset = vi.spyOn(db.query.resourceVersionAssetsInResource, "findFirst");

    await cloneContentAssets(db, userId, threeAssetContent, sourceResourceId, destinationResourceId);

    expect(findFirstResource).toHaveBeenCalledTimes(1);
    // The publication is one query per resource: its select, and the subquery select that checks the resource is live.
    // Both are counted, so a per-asset lookup would show as more than two
    expect(select).toHaveBeenCalledTimes(2);
    expect(findFirstPublishedAsset).toHaveBeenCalledTimes(3);
    expect((await getBlobNames(`${destinationResourceId}/`)).toSorted()).toStrictEqual(threeDestinationBlobNames);
  });
});
