import type { reserveStorageBytes } from "#server/services/storage/reserveStorageBytes";
import type { Context } from "#server/trpc/context";
import type { ContainerClient } from "@azure/storage-blob";

import { generateReservedResourceAssetSasEntities } from "#server/services/resource/generateReservedResourceAssetSasEntities";
import { FILES_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";
import { AzureContainer } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockRestError } from "azure-mock";
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
  const hash = "a".repeat(64);
  const blobName = `${resourceId}/${FILES_DIRECTORY_SEGMENT}/${hash}`;
  const file = { hash, mimetype: "image/png", size: 1 };
  const db = {} as Context["db"];
  // The blobs Azure already holds. A PUT that lands is what adds to it, so a case marks one held the way an upload would.
  // A touch of a blob not held answers not found
  let heldBlobNames: Set<string>;

  beforeEach(() => {
    heldBlobNames = new Set();
    containerClientMock.current = {
      getBlobClient: (name: string) => ({
        setMetadata: (metadata: Record<string, string>) => {
          setMetadataMock(name, metadata);
          return heldBlobNames.has(name) ? Promise.resolve({}) : Promise.reject(new MockRestError("", 404));
        },
      }),
      getBlockBlobClient: (name: string) => ({ generateSasUrl: () => Promise.resolve(`https://sas.example/${name}`) }),
    } as unknown as ContainerClient;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("uploading the same bytes twice gives one address", async () => {
    expect.hasAssertions();

    const firstEntity = takeOne(await generateReservedResourceAssetSasEntities(db, userId, resourceId, [file]));
    heldBlobNames.add(blobName);
    const secondEntity = takeOne(await generateReservedResourceAssetSasEntities(db, userId, resourceId, [file]));

    expect(firstEntity).toStrictEqual({ id: hash, isHeld: false, sasUrl: `https://sas.example/${blobName}` });
    expect(secondEntity).toStrictEqual({ id: hash, isHeld: true, sasUrl: "" });
    expect(secondEntity.id).toBe(firstEntity.id);
    // Only the first upload reserves, so the owner's storage usage does not grow for the second
    expect(reserveStorageBytesMock).toHaveBeenNthCalledWith(1, db, userId, AzureContainer.ResourceAssets, [
      { blobName, declaredBytes: file.size },
    ]);
    expect(reserveStorageBytesMock).toHaveBeenNthCalledWith(2, db, userId, AzureContainer.ResourceAssets, []);
  });

  // The grace window the collection honours is measured from the last write, so re-uploading held bytes is what keeps an
  // Object a save is about to reference from being collected
  test("a held object is touched without a new reservation", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    heldBlobNames.add(blobName);
    const entity = takeOne(await generateReservedResourceAssetSasEntities(db, userId, resourceId, [file]));

    expect(entity).toStrictEqual({ id: hash, isHeld: true, sasUrl: "" });
    expect(setMetadataMock).toHaveBeenCalledExactlyOnceWith(blobName, { touchedAt: new Date(0).toISOString() });
    expect(reserveStorageBytesMock).toHaveBeenCalledExactlyOnceWith(db, userId, AzureContainer.ResourceAssets, []);
  });
});
