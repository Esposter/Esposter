import type { reserveStorageBytes } from "#server/services/storage/reserveStorageBytes";
import type { Context } from "#server/trpc/context";
import type { ContainerClient } from "@azure/storage-blob";

import { generateReservedResourceAssetSasEntities } from "#server/services/resource/generateReservedResourceAssetSasEntities";
import { StorageBucket, FILES_DIRECTORY_SEGMENT } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockRestError } from "azure-mock";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { containerClientMock, reserveStorageBytesMock, setMetadataMock } = vi.hoisted(() => ({
  containerClientMock: {} as { current: ContainerClient },
  reserveStorageBytesMock: vi.fn<typeof reserveStorageBytes>(),
  setMetadataMock: vi.fn<(blobName: string, metadata: Record<string, string>) => void>(),
}));

vi.mock(import("#server/composables/azure/container/useContainerClient"), () => ({
  useContainerClient: () => Promise.resolve(containerClientMock.current),
}));

vi.mock(import("#server/services/storage/reserveStorageBytes"), () => ({
  reserveStorageBytes: reserveStorageBytesMock,
}));

describe(generateReservedResourceAssetSasEntities, () => {
  const userId = crypto.randomUUID();
  const resourceId = crypto.randomUUID();
  // The file's bytes and the address they hash to. A held address is trusted only as far as the bytes under it hash to it
  const bytes = new Uint8Array(1);
  const hash = createHash("sha256").update(bytes).digest("hex");
  const blobName = `${resourceId}/${FILES_DIRECTORY_SEGMENT}/${hash}`;
  const file = { hash, mimetype: "image/png", size: bytes.byteLength };
  const db = {} as Context["db"];
  // The blobs Azure already holds, with the bytes each one stores. A PUT that lands is what adds to it, so a case marks one
  // Held the way an upload would
  let storedBlobs: Map<string, Uint8Array>;
  // The blobs a touch finds already deleted, so the touch answers not found
  let goneBlobNames: Set<string>;

  beforeEach(() => {
    storedBlobs = new Map();
    goneBlobNames = new Set();
    containerClientMock.current = {
      getBlobClient: (name: string) => ({
        setMetadata: (metadata: Record<string, string>) => {
          setMetadataMock(name, metadata);
          return storedBlobs.has(name) && !goneBlobNames.has(name)
            ? Promise.resolve({})
            : Promise.reject(new MockRestError("", 404));
        },
      }),
      getBlockBlobClient: (name: string) => ({
        deleteIfExists: () => {
          storedBlobs.delete(name);
          return Promise.resolve({ succeeded: true });
        },
        download: () => {
          const stored = storedBlobs.get(name);
          return stored
            ? Promise.resolve({ etag: "etag", readableStreamBody: Readable.from([stored]) })
            : Promise.reject(new MockRestError("", 404));
        },
        generateSasUrl: () => Promise.resolve(`https://sas.example/${name}`),
      }),
    } as unknown as ContainerClient;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("uploading the same bytes twice gives one address", async () => {
    expect.hasAssertions();

    const firstEntity = takeOne(await generateReservedResourceAssetSasEntities(db, userId, resourceId, [file]));
    storedBlobs.set(blobName, bytes);
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
    storedBlobs.set(blobName, bytes);
    const entity = takeOne(await generateReservedResourceAssetSasEntities(db, userId, resourceId, [file]));

    expect(entity).toStrictEqual({ id: hash, isHeld: true, sasUrl: "" });
    expect(setMetadataMock).toHaveBeenCalledExactlyOnceWith(blobName, { touchedAt: new Date(0).toISOString() });
    expect(reserveStorageBytesMock).toHaveBeenCalledExactlyOnceWith(db, userId, StorageBucket.ResourceAssets, []);
  });

  test("a held asset whose blob disappears before the touch is uploaded again", async () => {
    expect.hasAssertions();

    storedBlobs.set(blobName, bytes);
    goneBlobNames.add(blobName);
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

    storedBlobs.set(blobName, Uint8Array.of(1));
    const entity = takeOne(await generateReservedResourceAssetSasEntities(db, userId, resourceId, [file]));

    expect(entity).toStrictEqual({ id: hash, isHeld: false, sasUrl: `https://sas.example/${blobName}` });
    expect(storedBlobs.has(blobName)).toBe(false);
    expect(setMetadataMock).not.toHaveBeenCalled();
  });
});
