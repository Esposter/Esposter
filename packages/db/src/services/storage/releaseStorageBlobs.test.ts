import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { reconcileStorageBlob } from "@/services/storage/reconcileStorageBlob";
import { releaseStorageBlobs } from "@/services/storage/releaseStorageBlobs";
import { releaseStorageBlobsByPrefix } from "@/services/storage/releaseStorageBlobsByPrefix";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, storageBlobs, users } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

// The release and the reconcile are the two halves of one ledger: whichever settles a row is the only thing
// That may move the counter for it, so they are exercised against the same fixture.
describe("storage blob ledger", () => {
  let db: PostgresJsDatabase<typeof relations>;
  const userId = crypto.randomUUID();
  const containerName = AzureContainer.ResourceAssets;
  const resourceId = crypto.randomUUID();
  const blobName = `${resourceId}/files/blobName`;
  const declaredBytes = 10;
  const actualBytes = 4;
  const readStorageBytesUsed = async () =>
    (await db.query.users.findFirst({ columns: { storageBytesUsed: true }, where: { id: { eq: userId } } }))
      ?.storageBytesUsed;
  const createStorageBlob = async () => {
    await db.update(users).set({ storageBytesUsed: declaredBytes }).where(eq(users.id, userId));
    await db.insert(storageBlobs).values({
      blobName,
      containerName,
      countedBytes: declaredBytes,
      declaredBytes,
      expiresAt: new Date(),
      userId,
    });
  };

  beforeAll(async () => {
    db = await createMockDb();
    const createdAt = new Date();
    await db
      .insert(users)
      .values({
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

  test("gives the held bytes back and drops the row", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await releaseStorageBlobs(db, containerName, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(0);
    await expect(db.query.storageBlobs.findMany()).resolves.toStrictEqual([]);
  });

  test("releases a second time without decrementing again", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await releaseStorageBlobs(db, containerName, [blobName]);
    await db.update(users).set({ storageBytesUsed: declaredBytes }).where(eq(users.id, userId));
    // The row is what carries the amount, so a redelivered deletion event finds nothing left to give back
    await releaseStorageBlobs(db, containerName, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(declaredBytes);
  });

  test("releases a whole directory without enumerating it", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await releaseStorageBlobsByPrefix(db, containerName, `${resourceId}/`);

    await expect(readStorageBytesUsed()).resolves.toBe(0);
    await expect(db.query.storageBlobs.findMany()).resolves.toStrictEqual([]);
  });

  test("leaves another container's blobs alone", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await releaseStorageBlobs(db, AzureContainer.MessageAssets, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(declaredBytes);
  });

  test("replaces the declaration with the stored size", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlob(db, containerName, blobName, actualBytes);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);

    const [reconciledStorageBlob] = await db.query.storageBlobs.findMany();

    expect(reconciledStorageBlob).toMatchObject({ countedBytes: actualBytes, declaredBytes });
    expect(reconciledStorageBlob?.reconciledAt).not.toBeNull();
  });

  test("reconciles a second time without adjusting again", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlob(db, containerName, blobName, actualBytes);
    await reconcileStorageBlob(db, containerName, blobName, actualBytes);

    await expect(readStorageBytesUsed()).resolves.toBe(actualBytes);
  });

  test("gives the stored size back once a reconciled blob is deleted", async () => {
    expect.hasAssertions();

    await createStorageBlob();
    await reconcileStorageBlob(db, containerName, blobName, actualBytes);
    await releaseStorageBlobs(db, containerName, [blobName]);

    await expect(readStorageBytesUsed()).resolves.toBe(0);
  });
});
