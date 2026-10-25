import type { Database } from "@esposter/db-schema";

import { deleteOrphanedProfileImageHandler } from "#src/handlers/deleteOrphanedProfileImageHandler";
import { createEventGridEvent } from "#src/services/azure/createEventGridEvent.test";
import { getContainerClient } from "#src/services/azure/getContainerClient";
import { createUser } from "#src/services/shared/createUser.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { AzureContainer, getBlobSubjectPrefix, getUserProfileImageBlobName, usersInAuth } from "@esposter/db-schema";
import { MockContainerDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));

describe(deleteOrphanedProfileImageHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const userId = crypto.randomUUID();
  const blobContent = " ";
  const createBlobCreatedEvent = (blobName: string) =>
    createEventGridEvent({ subject: `${getBlobSubjectPrefix(AzureContainer.PublicUserAssets)}${blobName}` });
  const seedBlob = async (blobName: string) => {
    const containerClient = await getContainerClient(AzureContainer.PublicUserAssets);
    await containerClient.getBlockBlobClient(blobName).upload(blobContent, blobContent.length);
  };
  const hasBlob = (blobName: string) =>
    MockContainerDatabase.get(AzureContainer.PublicUserAssets)?.has(blobName) === true;

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
    await deleteOrphanedProfileImageHandler(createBlobCreatedEvent(blobName), context);

    expect(hasBlob(blobName)).toBe(false);
  });

  test("deletes a profile image whose account has asked to be deleted", async () => {
    expect.hasAssertions();

    await mockDb.update(usersInAuth).set({ deletionRequestedAt: new Date(0) });
    const blobName = getUserProfileImageBlobName(userId);
    await seedBlob(blobName);
    await deleteOrphanedProfileImageHandler(createBlobCreatedEvent(blobName), context);

    expect(hasBlob(blobName)).toBe(false);
  });

  test("keeps the profile image of an account in use", async () => {
    expect.hasAssertions();

    const blobName = getUserProfileImageBlobName(userId);
    await seedBlob(blobName);
    await deleteOrphanedProfileImageHandler(createBlobCreatedEvent(blobName), context);

    expect(hasBlob(blobName)).toBe(true);
  });

  // The room's prefix has no account behind it, so a missing row would match it without the name check
  test("keeps a room's profile image, which no account owns", async () => {
    expect.hasAssertions();

    const blobName = `rooms/${crypto.randomUUID()}/ProfileImage/${crypto.randomUUID()}`;
    await seedBlob(blobName);
    await deleteOrphanedProfileImageHandler(createBlobCreatedEvent(blobName), context);

    expect(hasBlob(blobName)).toBe(true);
  });
});
