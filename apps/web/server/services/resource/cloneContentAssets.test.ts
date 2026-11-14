import type { R2Bucket } from "@cloudflare/workers-types";
import type { Database } from "@esposter/db-schema";

import { cloneContentAssets } from "#server/services/resource/cloneContentAssets";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { deleteDirectory, listBlobNames } from "@esposter/db";
import { createMockBucket, createMockDb } from "@esposter/db-mock";
import {
  StorageBucket,
  FILES_DIRECTORY_SEGMENT,
  resourcePublicationsInResource,
  resourcesInResource,
  ResourceType,
  resourceVersionAssetsInResource,
  resourceVersionsInResource,
  SnapshotChannel,
  usersInAuth,
} from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { bucketMock } = vi.hoisted(() => ({ bucketMock: {} as { current: R2Bucket } }));

vi.mock(import("#server/services/storage/getBucket"), () => ({ getBucket: () => bucketMock.current }));

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
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets));
  });

  beforeEach(async () => {
    bucketMock.current = bucket;
    await Promise.all(
      [sourceBlobName, otherSourceBlobName, thirdBlobName].map((blobName) => bucket.put(blobName, new Uint8Array(1))),
    );
  });

  afterEach(async () => {
    await deleteDirectory(bucket);
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await dispose();
  });

  const getBlobNames = (prefix: string) => listBlobNames(bucket, prefix);

  test("duplicating a document copies its images to the new resource", async () => {
    expect.hasAssertions();

    const content = { html: `<img src="${getResourceAssetUrl(sourceBlobName)}">` };
    const clonedContent = await cloneContentAssets(
      createDatabase(true),
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
      createDatabase(true),
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

    await bucket.put(destinationBlobName, new Uint8Array(1));
    const content = { html: `<img src="${getResourceAssetUrl(sourceBlobName)}">` };
    const clonedContent = await cloneContentAssets(
      createDatabase(true),
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
    const clonedContent = await cloneContentAssets(
      createDatabase(false),
      userId,
      content,
      sourceResourceId,
      destinationResourceId,
    );

    await expect(getBlobNames(`${destinationResourceId}/`)).resolves.toStrictEqual([]);
    expect(clonedContent).toStrictEqual({ html: `<img src="${getResourceAssetUrl(sourceBlobName)}">` });
  });

  test("copies each distinct hash to its own destination address", async () => {
    expect.hasAssertions();

    const content = {
      html: `<img src="${getResourceAssetUrl(sourceBlobName)}"><img src="${getResourceAssetUrl(otherSourceBlobName)}">`,
    };
    await cloneContentAssets(createDatabase(true), userId, content, sourceResourceId, destinationResourceId);

    expect((await getBlobNames(`${destinationResourceId}/`)).toSorted()).toStrictEqual(
      [destinationBlobName, `${destinationResourceId}/${FILES_DIRECTORY_SEGMENT}/${otherHash}`].toSorted(),
    );
  });

  // A whiteboard names its image by the bare hash of its file, with no url for the url scan to find, so the copy must take
  // The file the element names in the form it is stored
  test("duplicating a whiteboard copies the file its element names by bare id", async () => {
    expect.hasAssertions();

    const content = { elements: [{ fileId: hash }] };
    const clonedContent = await cloneContentAssets(
      createDatabase(true),
      userId,
      content,
      sourceResourceId,
      destinationResourceId,
    );

    await expect(getBlobNames(`${destinationResourceId}/`)).resolves.toStrictEqual([destinationBlobName]);
    expect(clonedContent).toStrictEqual(content);
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

    await cloneContentAssets(db, userId, threeAssetContent, sourceResourceId, destinationResourceId);

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

    await cloneContentAssets(db, userId, threeAssetContent, sourceResourceId, destinationResourceId);

    expect(findFirstResource).toHaveBeenCalledTimes(1);
    expect(findFirstPublication).toHaveBeenCalledTimes(1);
    expect(findFirstPublishedAsset).toHaveBeenCalledTimes(3);
    expect((await getBlobNames(`${destinationResourceId}/`)).toSorted()).toStrictEqual(threeDestinationBlobNames);
  });
});
