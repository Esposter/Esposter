import type { Database, R2ObjectCreatedQueueMessage } from "@esposter/db-schema";

import { deleteOrphanedProfileImageHandler } from "#src/handlers/deleteOrphanedProfileImageHandler";
import { createUser } from "#src/services/shared/createUser.test";
import { getBucket } from "#src/services/storage/getBucket";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { createMockDb } from "@esposter/db-mock";
import { StorageBucket, getUserProfileImageBlobName, usersInAuth } from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));

const createObjectCreatedMessage = (key: string) =>
  ({
    bucket: StorageBucket.PublicUserAssets,
    eventTime: "2026-11-14T00:00:00.000Z",
    object: { key, size: 1 },
  }) satisfies R2ObjectCreatedQueueMessage;
const hasBlob = async (blobName: string) => (await getBucket(StorageBucket.PublicUserAssets).head(blobName)) !== null;

describe(deleteOrphanedProfileImageHandler, () => {
  const userId = crypto.randomUUID();
  const blobContent = " ";
  const seedBlob = async (blobName: string) => {
    await getBucket(StorageBucket.PublicUserAssets).put(blobName, blobContent);
  };

  beforeAll(async () => {
    mockDb = await createMockDb();
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

    const blobName = getUserProfileImageBlobName(crypto.randomUUID());
    await seedBlob(blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    await expect(hasBlob(blobName)).resolves.toBe(false);
  });

  test("deletes a profile image whose account has asked to be deleted", async () => {
    expect.hasAssertions();

    await mockDb.update(usersInAuth).set({ deletionRequestedAt: new Date(0) });
    const blobName = getUserProfileImageBlobName(userId);
    await seedBlob(blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    await expect(hasBlob(blobName)).resolves.toBe(false);
  });

  test("keeps the profile image of an account in use", async () => {
    expect.hasAssertions();

    const blobName = getUserProfileImageBlobName(userId);
    await seedBlob(blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    await expect(hasBlob(blobName)).resolves.toBe(true);
  });

  // The room's prefix has no account behind it, so a missing row would match it without the name check
  test("keeps a room's profile image, which no account owns", async () => {
    expect.hasAssertions();

    const blobName = `rooms/${crypto.randomUUID()}/ProfileImage/${crypto.randomUUID()}`;
    await seedBlob(blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    await expect(hasBlob(blobName)).resolves.toBe(true);
  });
});
