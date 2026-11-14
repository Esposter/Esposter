import type { Database, R2ObjectCreatedQueueMessage } from "@esposter/db-schema";

import { deleteOrphanedProfileImageHandler } from "#src/handlers/deleteOrphanedProfileImageHandler";
import { getContainerClient } from "#src/services/azure/getContainerClient";
import { createUser } from "#src/services/shared/createUser.test";
import { createMockDb } from "@esposter/db-mock";
import { StorageBucket, getUserProfileImageBlobName, usersInAuth } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));

const createObjectCreatedMessage = (key: string) =>
  ({
    bucket: StorageBucket.PublicUserAssets,
    eventTime: "2026-11-14T00:00:00.000Z",
    object: { key, size: 1 },
  }) satisfies R2ObjectCreatedQueueMessage;
const hasBlob = (blobName: string) => MockContainerDatabase.get(StorageBucket.PublicUserAssets)?.has(blobName) === true;

describe(deleteOrphanedProfileImageHandler, () => {
  const userId = crypto.randomUUID();
  const blobContent = " ";
  const seedBlob = async (blobName: string) => {
    const containerClient = await getContainerClient(StorageBucket.PublicUserAssets);
    await containerClient.getBlockBlobClient(blobName).upload(blobContent, blobContent.length);
  };

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(usersInAuth).values(createUser(userId));
  });

  afterEach(async () => {
    MockContainerDatabase.clear();
    await mockDb.update(usersInAuth).set({ deletionRequestedAt: null });
  });

  test("deletes a profile image that lands after its account is gone", async () => {
    expect.hasAssertions();

    const blobName = getUserProfileImageBlobName(crypto.randomUUID());
    await seedBlob(blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    expect(hasBlob(blobName)).toBe(false);
  });

  test("deletes a profile image whose account has asked to be deleted", async () => {
    expect.hasAssertions();

    await mockDb.update(usersInAuth).set({ deletionRequestedAt: new Date(0) });
    const blobName = getUserProfileImageBlobName(userId);
    await seedBlob(blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    expect(hasBlob(blobName)).toBe(false);
  });

  test("keeps the profile image of an account in use", async () => {
    expect.hasAssertions();

    const blobName = getUserProfileImageBlobName(userId);
    await seedBlob(blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    expect(hasBlob(blobName)).toBe(true);
  });

  // The room's prefix has no account behind it, so a missing row would match it without the name check
  test("keeps a room's profile image, which no account owns", async () => {
    expect.hasAssertions();

    const blobName = `rooms/${crypto.randomUUID()}/ProfileImage/${crypto.randomUUID()}`;
    await seedBlob(blobName);
    await deleteOrphanedProfileImageHandler(createObjectCreatedMessage(blobName));

    expect(hasBlob(blobName)).toBe(true);
  });
});
