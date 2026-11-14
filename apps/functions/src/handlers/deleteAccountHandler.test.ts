import type { Database } from "@esposter/db-schema";

import { deleteAccountHandler } from "#src/handlers/deleteAccountHandler";
import { getStreamTableClient } from "#src/services/streams/getStreamTableClient";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { createUser } from "#src/services/shared/createUser.test";
import { createEntity, getContentBlobName } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  accountsInAuth,
  StorageBucket,
  StreamTable,
  createMessageEntity,
  getUserProfileImageBlobName,
  MessageType,
  resourcesInResource,
  ResourceType,
  roomsInMessage,
  storageLedgerInStorage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockContainerClient, MockContainerDatabase, MockTableClient, MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));
vi.mock(import("#src/services/streams/getStreamTableClient"), () => import("#src/services/streams/getStreamTableClient.test"));
vi.mock(
  import("#src/services/server/publishToServer"),
  () => import("#src/services/server/publishToServer.test"),
);

const readUserRows = (userId: string) =>
  mockDb.select({ id: usersInAuth.id }).from(usersInAuth).where(eq(usersInAuth.id, userId));

describe(deleteAccountHandler, () => {
  const name = "name";
  const countedBytes = 1;

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockDb.delete(usersInAuth);
  });

  test("deletes the user row, and the sign-in accounts it holds cascade with it", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    await mockDb
      .insert(accountsInAuth)
      .values({ accountId: "accountId", id: crypto.randomUUID(), providerId: "providerId", userId });

    await deleteAccountHandler({ userId });

    await expect(readUserRows(userId)).resolves.toStrictEqual([]);
    await expect(
      mockDb.select({ id: accountsInAuth.id }).from(accountsInAuth).where(eq(accountsInAuth.userId, userId)),
    ).resolves.toStrictEqual([]);
  });

  test("keeps the user row when the blob sweep fails, so the redelivery can finish it", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    // Nothing is seeded for the earlier steps, so the first listing the handler makes is the blob sweep's
    vi.spyOn(MockContainerClient.prototype, "listBlobsFlat").mockImplementation(() => {
      throw new Error(" ");
    });

    await expect(deleteAccountHandler({ userId })).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
    await expect(readUserRows(userId)).resolves.toStrictEqual([{ id: userId }]);
  });

  test("a second run over a finished sweep finds nothing and succeeds", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const fileId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: memberRoom.id, userId });
    const ownedResource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Note, userId }).returning(),
    );
    await new MockTableClient("", StreamTable.MessagesMetadata).createEntity({
      partitionKey: ownedRoom.id,
      rowKey: crypto.randomUUID(),
    });
    await createEntity(
      getStreamTableClient(StreamTable.Messages),
      createMessageEntity({ message: "message", roomId: memberRoom.id, type: MessageType.Message, userId }),
    );
    await seedBlob(StorageBucket.ResourceAssets, getContentBlobName(ownedResource.id));
    await seedBlob(StorageBucket.PublicUserAssets, getUserProfileImageBlobName(userId));
    await seedBlob(StorageBucket.MessageAssets, `${ownedRoom.id}/${fileId}`);
    await seedBlob(StorageBucket.MessageAssets, `${memberRoom.id}/${fileId}`);
    await mockDb
      .insert(storageLedgerInStorage)
      .values({
        blobName: `${memberRoom.id}/${fileId}`,
        containerName: StorageBucket.MessageAssets,
        countedBytes,
        declaredBytes: countedBytes,
        expiresAt: new Date(0),
        userId,
      });
    await mockDb.update(usersInAuth).set({ storageBytesUsed: countedBytes }).where(eq(usersInAuth.id, userId));

    await expect(deleteAccountHandler({ userId })).resolves.toBeUndefined();
    await expect(deleteAccountHandler({ userId })).resolves.toBeUndefined();

    await expect(readUserRows(userId)).resolves.toStrictEqual([]);
    await expect(
      mockDb.select({ id: roomsInMessage.id }).from(roomsInMessage).where(eq(roomsInMessage.userId, userId)),
    ).resolves.toStrictEqual([]);
    expect(readBlobNames(StorageBucket.ResourceAssets)).toStrictEqual([]);
    expect(readBlobNames(StorageBucket.PublicUserAssets)).toStrictEqual([]);
    expect(readBlobNames(StorageBucket.MessageAssets)).toStrictEqual([]);
  });
});
