import type { Context } from "@@/server/trpc/context";

import { MAX_UNRECONCILED_STORAGE_BLOBS } from "#shared/services/storage/constants";
import { StorageTierQuotaMap } from "#shared/services/storage/StorageTierQuotaMap";
import { reserveStorageBytes } from "@@/server/services/storage/reserveStorageBytes";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { AzureContainer, storageBlobs, StorageTier, users, WRITE_SAS_DURATION_MS } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("reserveStorageBytes", () => {
  let mockContext: Context;
  let userId: string;
  const containerName = AzureContainer.MessageAssets;
  const blobName = "blobName";
  const declaredBytes = 1;
  const quotaBytes = StorageTierQuotaMap[StorageTier.Free];
  const readStorageBytesUsed = async () =>
    (await mockContext.db.query.users.findFirst({ columns: { storageBytesUsed: true }, where: { id: { eq: userId } } }))
      ?.storageBytesUsed;

  beforeAll(async () => {
    mockContext = await createMockContext();
    ({
      user: { id: userId },
    } = await mockSessionOnce(mockContext.db));
  });

  afterEach(async () => {
    await mockContext.db.delete(storageBlobs);
    await mockContext.db.update(users).set({ storageBytesUsed: 0, storageTier: StorageTier.Free });
  });

  test("holds the space in the ledger without counting it against the user", async () => {
    expect.hasAssertions();

    await reserveStorageBytes(mockContext.db, userId, containerName, [{ blobName, declaredBytes }]);

    // Nothing is stored yet, so nothing is charged — storage reporting the blob is what moves the counter
    await expect(readStorageBytesUsed()).resolves.toBe(0);

    const ledgeredStorageBlobs = await mockContext.db.query.storageBlobs.findMany();

    expect(ledgeredStorageBlobs).toHaveLength(1);
    expect(ledgeredStorageBlobs[0]).toMatchObject({
      blobName,
      containerName,
      countedBytes: 0,
      declaredBytes,
      reconciledAt: null,
      userId,
    });
  });

  test("does nothing when there is nothing to reserve", async () => {
    expect.hasAssertions();

    await reserveStorageBytes(mockContext.db, userId, containerName, []);

    await expect(mockContext.db.query.storageBlobs.findMany()).resolves.toStrictEqual([]);
  });

  test("rejects a reservation that would cross the tier's quota", async () => {
    expect.hasAssertions();

    await mockContext.db.update(users).set({ storageBytesUsed: quotaBytes }).where(eq(users.id, userId));

    await expect(
      reserveStorageBytes(mockContext.db, userId, containerName, [{ blobName, declaredBytes }]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: You have run out of storage.]`);
    // The whole transaction rolls back, so a rejected reserve leaves no hold behind either
    await expect(mockContext.db.query.storageBlobs.findMany()).resolves.toStrictEqual([]);
  });

  test("counts a hold that has not landed yet against the quota", async () => {
    expect.hasAssertions();

    await reserveStorageBytes(mockContext.db, userId, containerName, [{ blobName, declaredBytes: quotaBytes }]);

    // The counter is still zero, so only the outstanding hold can be what rejects this
    await expect(readStorageBytesUsed()).resolves.toBe(0);
    await expect(
      reserveStorageBytes(mockContext.db, userId, containerName, [{ blobName: `${blobName}Second`, declaredBytes }]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: You have run out of storage.]`);
  });

  test("stops counting a hold whose write sas has expired, and drops it", async () => {
    expect.hasAssertions();

    await mockContext.db.insert(storageBlobs).values({
      blobName,
      containerName,
      countedBytes: 0,
      declaredBytes: quotaBytes,
      // An upload that was never made: its SAS is long dead, so the space it claimed is not claimed by anything
      expiresAt: new Date(Date.now() - WRITE_SAS_DURATION_MS),
      userId,
    });
    await reserveStorageBytes(mockContext.db, userId, containerName, [
      { blobName: `${blobName}Second`, declaredBytes },
    ]);

    const ledgeredStorageBlobs = await mockContext.db.query.storageBlobs.findMany();

    expect(ledgeredStorageBlobs).toHaveLength(1);
    expect(ledgeredStorageBlobs[0]?.blobName).toBe(`${blobName}Second`);
  });

  test("rejects once too many holds are outstanding", async () => {
    expect.hasAssertions();

    const outstandingReservations = Array.from({ length: MAX_UNRECONCILED_STORAGE_BLOBS }, (_, index) => ({
      blobName: `${blobName}${index}`,
      declaredBytes,
    }));
    await reserveStorageBytes(mockContext.db, userId, containerName, outstandingReservations);

    await expect(
      reserveStorageBytes(mockContext.db, userId, containerName, [{ blobName, declaredBytes }]),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Too many uploads are still in flight — wait for them to finish.]`,
    );
  });
});
