import type { Database } from "@esposter/db-schema";

import { deleteAccountHandler } from "#src/handlers/deleteAccountHandler";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import {
  clearMockRooms,
  getRoomObject,
  openMockRooms,
  readMockRoomTableNames,
} from "#src/services/room/getRoomObject.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { getContentBlobName } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  accountsInAuth,
  getUserProfileImageBlobName,
  MessageType,
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
  const message = "message";
  const name = "name";
  const countedBytes = 1;

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockRooms();
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
    clearMockRooms();
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
    await getRoomObject(ownedRoom.id).createMessage({ message, type: MessageType.Message }, { userId });
    await getRoomObject(memberRoom.id).createMessage({ message, type: MessageType.Message }, { userId });
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
    expect(readMockRoomTableNames(ownedRoom.id)).toStrictEqual([]);
    expect(getRoomObject(memberRoom.id).readMessages({ limit: 10 })).toStrictEqual([]);
    await expect(readBlobNames(StorageBucket.ResourceAssets)).resolves.toStrictEqual([]);
    await expect(readBlobNames(StorageBucket.PublicUserAssets)).resolves.toStrictEqual([]);
    await expect(readBlobNames(StorageBucket.MessageAssets)).resolves.toStrictEqual([]);
  });
});
