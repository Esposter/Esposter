import type { reserveStorageBytes } from "#server/services/storage/reserveStorageBytes";
import type { Context } from "#server/trpc/context";
import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageCredentials } from "@esposter/db";

import { generateReservedResourceAssetSasEntities } from "#server/services/resource/generateReservedResourceAssetSasEntities";
import { createMockBucket } from "@esposter/db-mock";
import { FILES_DIRECTORY_SEGMENT, StorageBucket } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { createHash } from "node:crypto";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const { bucketMock, reserveStorageBytesMock } = vi.hoisted(() => ({
  bucketMock: {} as { current: R2Bucket },
  reserveStorageBytesMock: vi.fn<typeof reserveStorageBytes>(),
}));

vi.mock(import("#server/services/storage/getBucket"), () => ({ getBucket: () => bucketMock.current }));

vi.mock(import("#server/services/storage/reserveStorageBytes"), () => ({
  reserveStorageBytes: reserveStorageBytesMock,
}));

// The signature is the only part a test cannot check without the account's credentials, so it is stood in for by a url
// Naming the object
vi.mock(import("@esposter/db"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    createPresignedPutUrl: (_credentials: StorageCredentials, _bucketName: StorageBucket, objectKey: string) =>
      Promise.resolve(`https://sas.example/${objectKey}`),
  };
});

describe(generateReservedResourceAssetSasEntities, () => {
  const userId = v7();
  const resourceId = v7();
  // The file's bytes and the address they hash to. A held address is trusted only as far as the bytes under it hash to it
  const bytes = new Uint8Array(1);
  const hash = createHash("sha256").update(bytes).digest("hex");
  const blobName = `${resourceId}/${FILES_DIRECTORY_SEGMENT}/${hash}`;
  const file = { hash, mimetype: "image/png", size: bytes.byteLength };
  const db = {} as Context["db"];
  let bucket: Awaited<ReturnType<typeof createMockBucket>>["bucket"];
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ bucket, dispose } = await createMockBucket(StorageBucket.ResourceAssets));
  });

  beforeEach(() => {
    bucketMock.current = bucket;
  });

  afterEach(async () => {
    vi.useRealTimers();
    await bucket.delete(blobName);
  });

  afterAll(async () => {
    await dispose();
  });

  test("uploading the same bytes twice gives one address", async () => {
    expect.hasAssertions();

    const firstEntity = takeOne(await generateReservedResourceAssetSasEntities(db, userId, resourceId, [file]));
    await bucket.put(blobName, bytes);
    const secondEntity = takeOne(await generateReservedResourceAssetSasEntities(db, userId, resourceId, [file]));

    expect(firstEntity).toStrictEqual({ id: hash, isHeld: false, sasUrl: `https://sas.example/${blobName}` });
    expect(secondEntity).toStrictEqual({ id: hash, isHeld: true, sasUrl: "" });
    expect(secondEntity.id).toBe(firstEntity.id);
    // Only the first upload reserves, so the owner's storage usage does not grow for the second
    expect(reserveStorageBytesMock).toHaveBeenNthCalledWith(1, db, userId, StorageBucket.ResourceAssets, [
      { blobName, declaredBytes: file.size },
    ]);
    expect(reserveStorageBytesMock).toHaveBeenNthCalledWith(2, db, userId, StorageBucket.ResourceAssets, []);
  });

  // The grace window the collection honours is measured from the last write, so re-uploading held bytes is what keeps an
  // Object a save is about to reference from being collected
  test("a held object is touched without a new reservation", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    await bucket.put(blobName, bytes);
    const entity = takeOne(await generateReservedResourceAssetSasEntities(db, userId, resourceId, [file]));

    expect(entity).toStrictEqual({ id: hash, isHeld: true, sasUrl: "" });
    expect((await bucket.head(blobName))?.customMetadata).toStrictEqual({ touchedAt: new Date(0).toISOString() });
    expect(reserveStorageBytesMock).toHaveBeenCalledExactlyOnceWith(db, userId, StorageBucket.ResourceAssets, []);
  });

  test("a held asset whose blob disappears before the touch is uploaded again", async () => {
    expect.hasAssertions();

    // The hash check reads the blob, and the touch that follows finds it gone
    let reads = 0;
    bucketMock.current = {
      get: () => Promise.resolve(reads++ === 0 ? { body: new Response(bytes).body } : null),
    } as unknown as R2Bucket;
    const entity = takeOne(await generateReservedResourceAssetSasEntities(db, userId, resourceId, [file]));

    expect(entity).toStrictEqual({ id: hash, isHeld: false, sasUrl: `https://sas.example/${blobName}` });
    expect(reserveStorageBytesMock).toHaveBeenCalledExactlyOnceWith(db, userId, StorageBucket.ResourceAssets, [
      { blobName, declaredBytes: file.size },
    ]);
  });

  // A held name is trusted on existence alone only if nothing checked what it holds: bytes other than the file's under the
  // Same address must not skip the PUT, and must be removed so the file's own bytes can take the name
  test("a held address whose stored bytes do not hash to it is removed and uploaded again", async () => {
    expect.hasAssertions();

    await bucket.put(blobName, Uint8Array.of(1));
    const entity = takeOne(await generateReservedResourceAssetSasEntities(db, userId, resourceId, [file]));

    expect(entity).toStrictEqual({ id: hash, isHeld: false, sasUrl: `https://sas.example/${blobName}` });
    await expect(bucket.head(blobName)).resolves.toBeNull();
  });
});
