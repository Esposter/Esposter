import type { Database } from "@esposter/db-schema";

import { deleteAccountHandler } from "#src/handlers/deleteAccountHandler";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { clearRoomObjectCalls, roomObjectCalls, roomObjectReplies } from "#src/services/room/getRoomObject.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { getContentBlobName } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  accountsInAuth,
  getUserProfileImageBlobName,
  resourcesInResource,
  ResourceType,
  roomsInMessage,
  StorageBucket,
  storageLedgerInStorage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

// A bucket binding is a proxy a spy cannot reach, so the blob sweep is failed at its own step instead
const blobSweepFailure = vi.hoisted(() => ({ error: undefined as Error | undefined }));

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));
vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));
vi.mock(import("#src/services/account/deleteAccountBlobDirectories"), async (importOriginal) => {
  const { deleteAccountBlobDirectories } = await importOriginal();
  return {
    deleteAccountBlobDirectories: async (userId: string) => {
      if (blobSweepFailure.error) throw blobSweepFailure.error;
      await deleteAccountBlobDirectories(userId);
    },
  };
});

const readUserRows = (userId: string) =>
  mockDb.select({ id: usersInAuth.id }).from(usersInAuth).where(eq(usersInAuth.id, userId));

describe(deleteAccountHandler, () => {
  const name = "name";
  const countedBytes = 1;

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([
      StorageBucket.ClickerAssets,
      StorageBucket.GenshinAssets,
      StorageBucket.MessageAssets,
      StorageBucket.PublicUserAssets,
      StorageBucket.ResourceAssets,
      StorageBucket.UserAssets,
    ]);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    blobSweepFailure.error = undefined;
    await clearMockBuckets();
    clearRoomObjectCalls();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("deletes the user row, and the sign-in accounts it holds cascade with it", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    await mockDb.insert(accountsInAuth).values({ accountId: "accountId", id: v7(), providerId: "providerId", userId });

    await deleteAccountHandler({ userId });

    await expect(readUserRows(userId)).resolves.toStrictEqual([]);
    await expect(
      mockDb.select({ id: accountsInAuth.id }).from(accountsInAuth).where(eq(accountsInAuth.userId, userId)),
    ).resolves.toStrictEqual([]);
  });

  test("keeps the user row when the blob sweep fails, so the redelivery can finish it", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    blobSweepFailure.error = new Error(" ");

    await expect(deleteAccountHandler({ userId })).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
    await expect(readUserRows(userId)).resolves.toStrictEqual([{ id: userId }]);
  });

  test("a second run over a finished sweep finds nothing and succeeds", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    const fileId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: memberRoom.id, userId });
    const ownedResource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Note, userId }).returning(),
    );
    // The erase reads what the member room answers: no message of the account's to erase, and no scheduled message
    roomObjectReplies.set("deleteUserMessages", () => []);
    roomObjectReplies.set("readScheduledMessages", () => []);
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
    // Only the first run sends anything: the second finds no owned room and no membership left
    expect(roomObjectCalls).toStrictEqual([
      {
        args: [{ data: { roomId: ownedRoom.id, userId }, type: "deleteRoom" }],
        method: "notifyOnlineMembers",
        roomId: ownedRoom.id,
      },
      { args: [], method: "deleteAll", roomId: ownedRoom.id },
      { args: [userId], method: "deleteUserMessages", roomId: memberRoom.id },
      { args: [userId], method: "readScheduledMessages", roomId: memberRoom.id },
      { args: [userId], method: "deleteUserReactions", roomId: memberRoom.id },
      { args: [userId], method: "removeMember", roomId: memberRoom.id },
      {
        args: [{ data: { roomId: memberRoom.id, userId }, type: "leaveRoom" }],
        method: "notifyOnlineMembers",
        roomId: memberRoom.id,
      },
    ]);
    await expect(readBlobNames(StorageBucket.ResourceAssets)).resolves.toStrictEqual([]);
    await expect(readBlobNames(StorageBucket.PublicUserAssets)).resolves.toStrictEqual([]);
    await expect(readBlobNames(StorageBucket.MessageAssets)).resolves.toStrictEqual([]);
  });
});
