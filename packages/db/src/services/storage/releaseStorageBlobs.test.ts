import type { Database } from "@esposter/db-schema";

import { reconcileStorageBlob } from "#src/services/storage/reconcileStorageBlob";
import { releaseStorageBlobs } from "#src/services/storage/releaseStorageBlobs";
import { releaseStorageBlobsByPrefix } from "#src/services/storage/releaseStorageBlobsByPrefix";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, storageBlobs, users } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The counter carries stored bytes and nothing else, so every case here is about which of the two signals —
// Storage saying a blob landed, or a deletion saying it is gone — moved it, and by how much.
describe("storage blob ledger", () => {
  let db: Database;
  const userId = crypto.randomUUID();
  const containerName = AzureContainer.ResourceAssets;
  const resourceId = crypto.randomUUID();
  const blobName = `${resourceId}/files/blobName`;
  const declaredBytes = 10;
  const actualBytes = 4;
  const overwrittenBytes = 7;
  const readStorageBytesUsed = async () =>
    (await db.query.users.findFirst({ columns: { storageBytesUsed: true }, where: { id: { eq: userId } } }))
      ?.storageBytesUsed;
  // A hold as the reserve writes it: the space is claimed through declaredBytes, but nothing is counted
  // Against the user until storage reports what landed
  const createStorageBlob = () =>
    db.insert(storageBlobs).values({
      blobName,
      containerName,
      countedBytes: 0,
      declaredBytes,
      expiresAt: new Date(),
      userId,
    });

  beforeAll(async () => {
    db = await createMockDb();
    const createdAt = new Date();
    await db.insert(users).values({
      createdAt,
      email: userId,
      emailVerified: true,
      id: userId,
      image: "",
      name: "name",
      updatedAt: createdAt,
    });
  });

  afterEach(async () => {
    await db.delete(storageBlobs);
    await db.update(users).set({ storageBytesUsed: 0 });
  });

  test("counts the size storage reports, not the size the client declared", async () => {
    expect.hasAssertions();

    await createStorageBlob();

    await expect(reconcileStorageBlob(db, containerName, blobName, actualBytes)).resolves.toBe(true);
    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);

    const [reconciledStorageBlob] = await db.query.storageBlobs.findMany();

    expect(reconciledStorageBlob).toMatchObject({ countedBytes: actualBytes, declaredBytes });
    expect(reconciledStorageBlob?.reconciledAt).not.toBeNull();
  });

  test("computes a zero delta for a redelivered event", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlob(db, containerName, blobName, actualBytes);
    await reconcileStorageBlob(db, containerName, blobName, actualBytes);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);
  });

  test("corrects the counter when the same write target is uploaded again", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlob(db, containerName, blobName, actualBytes);
    // The SAS outlives one PUT, so a second upload replaces the blob — the counter must follow it rather
    // Than keep charging for the size the first one had
    await reconcileStorageBlob(db, containerName, blobName, overwrittenBytes);

    await expect(readStorageBytesUsed()).resolves.toBe(overwrittenBytes);
  });

  test("accounts a blob nothing reserved to nobody", async () => {
    expect.hasAssertions();

    await expect(reconcileStorageBlob(db, containerName, blobName, actualBytes)).resolves.toBe(false);
    await expect(readStorageBytesUsed()).resolves.toBe(0);
  });

  test("gives the stored size back when the blob is deleted", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlob(db, containerName, blobName, actualBytes);
    await releaseStorageBlobs(db, containerName, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(0);
    await expect(db.query.storageBlobs.findMany()).resolves.toStrictEqual([]);
  });

  test("releases a second time without decrementing again", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlob(db, containerName, blobName, actualBytes);
    await releaseStorageBlobs(db, containerName, [blobName]);
    await db.update(users).set({ storageBytesUsed: actualBytes }).where(eq(users.id, userId));
    // The row is what carries the amount, so a redelivered deletion event finds nothing left to give back
    await releaseStorageBlobs(db, containerName, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);
  });

  test("takes nothing off the counter for a hold that never landed", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await releaseStorageBlobs(db, containerName, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(0);
    await expect(db.query.storageBlobs.findMany()).resolves.toStrictEqual([]);
  });

  test("releases a whole directory without enumerating it", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlob(db, containerName, blobName, actualBytes);
    await releaseStorageBlobsByPrefix(db, containerName, `${resourceId}/`);

    await expect(readStorageBytesUsed()).resolves.toBe(0);
    await expect(db.query.storageBlobs.findMany()).resolves.toStrictEqual([]);
  });

  test("leaves another container's blobs alone", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlob(db, containerName, blobName, actualBytes);
    await releaseStorageBlobs(db, AzureContainer.MessageAssets, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);
  });
});
