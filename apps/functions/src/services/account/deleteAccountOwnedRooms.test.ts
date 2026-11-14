import type { Database } from "@esposter/db-schema";

import { deleteAccountOwnedRooms } from "#src/services/account/deleteAccountOwnedRooms";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { readPartitionEntities } from "#src/services/azure/readPartitionEntities.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { createUser } from "#src/services/shared/createUser.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { StorageBucket, StreamTable, roomsInMessage, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockTableClient, MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));
vi.mock(import("#src/services/azure/getSearchClient"), () => import("#src/services/azure/getSearchClient.test"));
vi.mock(import("#src/services/streams/getStreamTableClient"), () => import("#src/services/streams/getStreamTableClient.test"));
vi.mock(
  import("#src/services/server/publishToServer"),
  () => import("#src/services/server/publishToServer.test"),
);

// A partition's rows are only ever read by their partition key, so one row keyed by the room is the whole fixture
const seedPartitionRow = (tableName: StreamTable, partitionKey: string) =>
  new MockTableClient("", tableName).createEntity({ partitionKey, rowKey: crypto.randomUUID() });

describe(deleteAccountOwnedRooms, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const name = "name";
  const roomTableNames = [
    StreamTable.Messages,
    StreamTable.MessagesMetadata,
    StreamTable.ModerationLog,
    StreamTable.ModerationNotes,
  ];

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
    await mockDb.delete(usersInAuth);
  });

  test("deletes an owned room's partitions, attachments and row, and no other owner's room", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const fileId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const otherRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await Promise.all(
      roomTableNames.flatMap((tableName) => [
        seedPartitionRow(tableName, ownedRoom.id),
        seedPartitionRow(tableName, otherRoom.id),
      ]),
    );
    await seedBlob(StorageBucket.MessageAssets, `${ownedRoom.id}/${fileId}`);
    await seedBlob(StorageBucket.MessageAssets, `${otherRoom.id}/${fileId}`);
    await seedBlob(StorageBucket.PublicUserAssets, `rooms/${ownedRoom.id}/ProfileImage`);
    await seedBlob(StorageBucket.PublicUserAssets, `rooms/${otherRoom.id}/ProfileImage`);

    await deleteAccountOwnedRooms(context, userId);

    expect(roomTableNames.flatMap((tableName) => readPartitionEntities(tableName, ownedRoom.id))).toStrictEqual([]);
    expect(roomTableNames.flatMap((tableName) => readPartitionEntities(tableName, otherRoom.id))).toHaveLength(
      roomTableNames.length,
    );
    expect(readBlobNames(StorageBucket.MessageAssets)).toStrictEqual([`${otherRoom.id}/${fileId}`]);
    expect(readBlobNames(StorageBucket.PublicUserAssets)).toStrictEqual([`rooms/${otherRoom.id}/ProfileImage`]);
    await expect(mockDb.select({ id: roomsInMessage.id }).from(roomsInMessage)).resolves.toStrictEqual([
      { id: otherRoom.id },
    ]);
  });
});
