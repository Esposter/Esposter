import type { Database, R2ObjectCreatedQueueMessage } from "@esposter/db-schema";

import { deleteOrphanedProfileImageHandler } from "#src/handlers/deleteOrphanedProfileImageHandler";
import { getBucket } from "#src/services/storage/getBucket";
import { seedBlob } from "#src/services/storage/seedBlob.test";
import { clearMockBuckets, createMockDb, createUser, disposeMockBuckets, openMockBuckets } from "@esposter/db-mock";
import { getUserProfileImageBlobName, StorageBucket, usersInAuth } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/getDb"), () => ({
  getDb() {
    return mockDb;
  },
}));

vi.mock(import("#src/services/storage/getBucket"), () => import("@esposter/db-mock"));

const createObjectCreatedMessage = (key: string) =>
  ({
    bucket: StorageBucket.PublicUserAssets,
    eventTime: new Date(0).toISOString(),
    object: { key, size: 1 },
  }) satisfies R2ObjectCreatedQueueMessage;
const checkHasBlob = async (blobName: string) =>
  (await getBucket(StorageBucket.PublicUserAssets).head(blobName)) !== null;

describe(deleteOrphanedProfileImageHandler, () => {
  const userId = v7();

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([StorageBucket.PublicUserAssets]);
    await mockDb.insert(usersInAuth).values(createUser(userId));
  });

  afterEach(async () => {
    await clearMockBuckets();
    await mockDb.update(usersInAuth).set({ deletionRequestedAt: null });
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("deletes a profile image that lands after its account is gone", async () => {
    expect.hasAssertions();

    const blobName = getUserProfileImageBlobName(v7());
    await seedBlob(StorageBucket.PublicUserAssets, blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    await expect(checkHasBlob(blobName)).resolves.toBe(false);
  });

  test("deletes a profile image whose account has asked to be deleted", async () => {
    expect.hasAssertions();

    await mockDb.update(usersInAuth).set({ deletionRequestedAt: new Date(0) });
    const blobName = getUserProfileImageBlobName(userId);
    await seedBlob(StorageBucket.PublicUserAssets, blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    await expect(checkHasBlob(blobName)).resolves.toBe(false);
  });

  test("keeps the profile image of an account in use", async () => {
    expect.hasAssertions();

    const blobName = getUserProfileImageBlobName(userId);
    await seedBlob(StorageBucket.PublicUserAssets, blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    await expect(checkHasBlob(blobName)).resolves.toBe(true);
  });

  // The room's prefix has no account behind it, so a missing row would match it without the name check
  test("keeps a room's profile image, which no account owns", async () => {
    expect.hasAssertions();

    const blobName = `rooms/${v7()}/ProfileImage/${v7()}`;
    await seedBlob(StorageBucket.PublicUserAssets, blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    await expect(checkHasBlob(blobName)).resolves.toBe(true);
  });
});
