import type { Database, StandardMessageEntity } from "@esposter/db-schema";

import { deleteAccountHandler } from "#src/handlers/deleteAccountHandler";
import { getContainerClient } from "#src/services/azure/getContainerClient";
import { getTableClient } from "#src/services/azure/getTableClient";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { readPartitionEntities } from "#src/services/azure/readPartitionEntities.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { createUser } from "#src/services/shared/createUser.test";
import { InvocationContext } from "@azure/functions";
import { CompositeKeyPropertyNames, serializeKey } from "@esposter/azure";
import {
  chargeStorageLedgerEntry,
  createEntity,
  createMessage,
  getContentBlobName,
  serializeEntity,
  writeJsonBlob,
  writeModerationLogEntry,
} from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  accountsInAuth,
  AdminActionType,
  apiKeysInAuth,
  StorageBucket,
  AzureTable,
  getReverseTickedTimestamp,
  getSaveBlobName,
  getUserProfileImageBlobName,
  MessageMetadataType,
  MessageType,
  ProgramParticipantEntity,
  ResourceActivityEntity,
  ResourceActivityType,
  resourcesInResource,
  ResourceType,
  resourceVersionsInResource,
  roomsInMessage,
  SearchIndex,
  sessionsInAuth,
  SnapshotChannel,
  storageLedgerInStorage,
  SurveyResponseEntity,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockSearchDatabase, MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));
vi.mock(import("#src/services/azure/getSearchClient"), () => import("#src/services/azure/getSearchClient.test"));
vi.mock(import("#src/services/azure/getTableClient"), () => import("#src/services/azure/getTableClient.test"));
vi.mock(
  import("#src/services/server/publishToServer"),
  () => import("#src/services/server/publishToServer.test"),
);

const readBlobNamesUnder = (containerName: StorageBucket, prefix: string) =>
  readBlobNames(containerName).filter((blobName) => blobName.startsWith(prefix));
const readLedgerRows = (userId: string) =>
  mockDb
    .select({ blobName: storageLedgerInStorage.blobName, containerName: storageLedgerInStorage.containerName })
    .from(storageLedgerInStorage)
    .where(eq(storageLedgerInStorage.userId, userId));
const readUserRows = (userId: string) =>
  mockDb.select({ id: usersInAuth.id }).from(usersInAuth).where(eq(usersInAuth.id, userId));
const readApiKeyRows = (userId: string) =>
  mockDb.select({ id: apiKeysInAuth.id }).from(apiKeysInAuth).where(eq(apiKeysInAuth.referenceId, userId));
describe(deleteAccountHandler, () => {
  const context = new InvocationContext({ logHandler: () => {} });
  const content = JSON.stringify({});
  const countedBytes = 1;
  const message = "message";
  const name = "name";
  const roomTableNames = [
    AzureTable.Messages,
    AzureTable.MessagesAscending,
    AzureTable.MessagesMetadata,
    AzureTable.ModerationLog,
    AzureTable.ModerationNotes,
  ];

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    MockSearchDatabase.clear();
    MockTableDatabase.clear();
    await mockDb.delete(usersInAuth);
  });

  const seedChargedBlob = async (userId: string, containerName: StorageBucket, blobName: string) => {
    await seedBlob(containerName, blobName);
    await chargeStorageLedgerEntry(mockDb, userId, containerName, blobName, countedBytes);
  };

  test("removes every store the inventory keys to the account, keeps what the spec names, and leaves the other account's data as it was", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const hash = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    await mockDb
      .insert(accountsInAuth)
      .values({ accountId: "accountId", id: crypto.randomUUID(), providerId: "providerId", userId });
    await mockDb
      .insert(sessionsInAuth)
      .values({ expiresAt: new Date(0), id: crypto.randomUUID(), token: crypto.randomUUID(), userId });

    // The account's owned room, with its own message, a member's membership, a profile image and a charged attachment
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const ownedRoomAttachmentBlobName = `${ownedRoom.id}/${crypto.randomUUID()}`;
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: ownedRoom.id, userId });
    await seedBlob(StorageBucket.PublicUserAssets, `rooms/${ownedRoom.id}/ProfileImage`);
    await seedChargedBlob(userId, StorageBucket.MessageAssets, ownedRoomAttachmentBlobName);

    // A room the account is a member of but does not own, with the account's messages, a charged attachment, and the
    // Other account's message and attachment beside them
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: memberRoom.id, userId },
      { roomId: memberRoom.id, userId: otherUserId },
    ]);
    const messageClient = await getTableClient(AzureTable.Messages);
    const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
    await createMessage(messageClient, messageAscendingClient, {
      message,
      roomId: ownedRoom.id,
      type: MessageType.Message,
      userId,
    });
    const memberRoomMessage = await createMessage(messageClient, messageAscendingClient, {
      files: [{ filename: "", hasThumbnail: false, id: crypto.randomUUID(), isSpoiler: false, mimetype: "", size: 0 }],
      message,
      roomId: memberRoom.id,
      type: MessageType.Message,
      userId,
    });
    const otherMemberRoomMessage = await createMessage(messageClient, messageAscendingClient, {
      message,
      roomId: memberRoom.id,
      type: MessageType.Message,
      userId: otherUserId,
    });
    const memberRoomAttachmentBlobName = `${memberRoom.id}/${crypto.randomUUID()}`;
    const otherMemberRoomAttachmentBlobName = `${memberRoom.id}/${crypto.randomUUID()}`;
    await seedChargedBlob(userId, StorageBucket.MessageAssets, memberRoomAttachmentBlobName);
    await seedChargedBlob(otherUserId, StorageBucket.MessageAssets, otherMemberRoomAttachmentBlobName);

    // The moderation record names the account in a room the account does not own, so it is kept
    await writeModerationLogEntry(await getTableClient(AzureTable.ModerationLog), {
      actorUserId: otherUserId,
      roomId: memberRoom.id,
      targetUserId: userId,
      type: AdminActionType.Warn,
    });

    // Reactions are one row per emoji that its reactors share. The account alone holds the first, which goes; it shares
    // The second with the other account, which keeps its id; the other account alone holds the third, which is kept.
    // The fourth is the account's in the owned room, which goes with the room's partition
    const messagesMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
    const createReaction = (roomId: string, reactorUserIds: string[]) => {
      const reaction = {
        emojiTag: "",
        messageRowKey: memberRoomMessage.rowKey,
        partitionKey: roomId,
        rowKey: getReverseTickedTimestamp(),
        type: MessageMetadataType.Emoji,
        userIds: reactorUserIds,
      };
      return messagesMetadataClient.createEntity(serializeEntity(reaction));
    };
    await createReaction(memberRoom.id, [userId]);
    await createReaction(memberRoom.id, [userId, otherUserId]);
    await createReaction(memberRoom.id, [otherUserId]);
    await createReaction(ownedRoom.id, [userId]);

    // The account's owned resource, with a working copy, a version and its activity trail
    const ownedResource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Note, userId }).returning(),
    );
    const resourceAssetsClient = await getContainerClient(StorageBucket.ResourceAssets);
    const contentBlobName = getContentBlobName(ownedResource.id);
    const { size: contentSize } = await writeJsonBlob(resourceAssetsClient, contentBlobName, content);
    await chargeStorageLedgerEntry(mockDb, userId, StorageBucket.ResourceAssets, contentBlobName, contentSize);
    // A version's object is stored under its resource's directory at its hash, as the snapshot store writes it
    const versionBlobName = `${ownedResource.id}/objects/${hash}`;
    const { size: versionSize } = await writeJsonBlob(resourceAssetsClient, versionBlobName, content);
    await chargeStorageLedgerEntry(mockDb, userId, StorageBucket.ResourceAssets, versionBlobName, versionSize);
    await mockDb
      .insert(resourceVersionsInResource)
      .values({
        channel: SnapshotChannel.Published,
        hash,
        plaintextBytes: versionSize,
        resourceId: ownedResource.id,
        storedBytes: versionSize,
        version: 0,
      });
    const resourceActivityClient = await getTableClient(AzureTable.ResourceActivity);
    await createEntity(
      resourceActivityClient,
      new ResourceActivityEntity({
        activityType: ResourceActivityType.Created,
        partitionKey: ownedResource.id,
        rowKey: getReverseTickedTimestamp(),
        userId,
      }),
    );

    // The account's owned survey and program, each with a row in the partition its type owns, and an API key.
    // The user row's cascade takes the API key
    const ownedSurvey = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Survey, userId }).returning(),
    );
    await createEntity(
      await getTableClient(AzureTable.SurveyResponses),
      new SurveyResponseEntity({ partitionKey: ownedSurvey.id, rowKey: crypto.randomUUID() }),
    );
    const ownedProgram = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Program, userId }).returning(),
    );
    await createEntity(
      await getTableClient(AzureTable.ProgramParticipants),
      new ProgramParticipantEntity({ partitionKey: ownedProgram.id, rowKey: crypto.randomUUID() }),
    );
    await mockDb
      .insert(apiKeysInAuth)
      .values({ id: crypto.randomUUID(), key: crypto.randomUUID(), referenceId: userId });

    // A resource the account does not own, with the account's own activity on it, which is kept
    const otherResource = takeOne(
      await mockDb
        .insert(resourcesInResource)
        .values({ name, type: ResourceType.Note, userId: otherUserId })
        .returning(),
    );
    await createEntity(
      resourceActivityClient,
      new ResourceActivityEntity({
        activityType: ResourceActivityType.ContentSaved,
        partitionKey: otherResource.id,
        rowKey: getReverseTickedTimestamp(),
        userId,
      }),
    );

    // The account's own blob directories
    await seedBlob(StorageBucket.PublicUserAssets, getUserProfileImageBlobName(userId));
    await seedBlob(StorageBucket.UserAssets, `${userId}/CallBackground/0`);
    await writeJsonBlob(await getContainerClient(StorageBucket.GenshinAssets), getSaveBlobName(userId), content);
    await seedBlob(StorageBucket.ClickerAssets, getSaveBlobName(userId));
    await seedBlob(StorageBucket.UserAssets, getSaveBlobName(userId));

    // The search index holds a document for the owned room's messages and one for the member room's. The sweep removes
    // The owned room's documents by its partition key, and the member room's document is not its to remove
    const indexedOwnedRoomDocument = {
      [serializeKey(CompositeKeyPropertyNames.partitionKey)]: ownedRoom.id,
      [serializeKey(CompositeKeyPropertyNames.rowKey)]: getReverseTickedTimestamp(),
    };
    const indexedMemberRoomDocument = {
      [serializeKey(CompositeKeyPropertyNames.partitionKey)]: memberRoom.id,
      [serializeKey(CompositeKeyPropertyNames.rowKey)]: memberRoomMessage.rowKey,
    };
    MockSearchDatabase.set(SearchIndex.Messages, [indexedOwnedRoomDocument, indexedMemberRoomDocument]);

    const otherUserRowBefore = await mockDb.select().from(usersInAuth).where(eq(usersInAuth.id, otherUserId));
    // Each seeded row is present before the deletion, so the empty checks below cannot pass vacuously
    expect(readPartitionEntities(AzureTable.SurveyResponses, ownedSurvey.id)).toHaveLength(1);
    expect(readPartitionEntities(AzureTable.ProgramParticipants, ownedProgram.id)).toHaveLength(1);
    await expect(readApiKeyRows(userId)).resolves.toHaveLength(1);
    await deleteAccountHandler(context, userId);

    // The user row is last, and the sign-in rows that cascade from it go with it
    await expect(readUserRows(userId)).resolves.toStrictEqual([]);
    await expect(
      mockDb.select({ id: accountsInAuth.id }).from(accountsInAuth).where(eq(accountsInAuth.userId, userId)),
    ).resolves.toStrictEqual([]);
    await expect(
      mockDb.select({ id: sessionsInAuth.id }).from(sessionsInAuth).where(eq(sessionsInAuth.userId, userId)),
    ).resolves.toStrictEqual([]);

    // The owned room, its partitions, its memberships, its profile image and its attachment
    await expect(
      mockDb.select({ id: roomsInMessage.id }).from(roomsInMessage).where(eq(roomsInMessage.userId, userId)),
    ).resolves.toStrictEqual([]);
    await expect(
      mockDb
        .select({ roomId: usersToRoomsInMessage.roomId })
        .from(usersToRoomsInMessage)
        .where(eq(usersToRoomsInMessage.roomId, ownedRoom.id)),
    ).resolves.toStrictEqual([]);
    expect(roomTableNames.flatMap((tableName) => readPartitionEntities(tableName, ownedRoom.id))).toStrictEqual([]);
    expect(readBlobNamesUnder(StorageBucket.PublicUserAssets, `rooms/${ownedRoom.id}/`)).toStrictEqual([]);
    expect(readBlobNamesUnder(StorageBucket.MessageAssets, `${ownedRoom.id}/`)).toStrictEqual([]);
    expect(MockSearchDatabase.get(SearchIndex.Messages)).toStrictEqual([indexedMemberRoomDocument]);

    // The owned resource, its version, its working copy, its objects and its activity trail
    await expect(
      mockDb
        .select({ id: resourcesInResource.id })
        .from(resourcesInResource)
        .where(eq(resourcesInResource.userId, userId)),
    ).resolves.toStrictEqual([]);
    await expect(
      mockDb
        .select({ version: resourceVersionsInResource.version })
        .from(resourceVersionsInResource)
        .where(eq(resourceVersionsInResource.resourceId, ownedResource.id)),
    ).resolves.toStrictEqual([]);
    expect(readBlobNamesUnder(StorageBucket.ResourceAssets, `${ownedResource.id}/`)).toStrictEqual([]);
    expect(readPartitionEntities(AzureTable.ResourceActivity, ownedResource.id)).toStrictEqual([]);

    // The owned survey's responses and the owned program's participants go with their resources
    // The API key goes with the user row
    expect(readPartitionEntities(AzureTable.SurveyResponses, ownedSurvey.id)).toStrictEqual([]);
    expect(readPartitionEntities(AzureTable.ProgramParticipants, ownedProgram.id)).toStrictEqual([]);
    await expect(readApiKeyRows(userId)).resolves.toStrictEqual([]);

    // The account's messages in the room it is a member of are erased and soft-deleted, and its charged attachment is gone
    const readDeletedAt = async (roomMessage: StandardMessageEntity) =>
      (await messageClient.getEntity<StandardMessageEntity>(roomMessage.partitionKey, roomMessage.rowKey)).deletedAt;
    await expect(readDeletedAt(memberRoomMessage)).resolves.toBeInstanceOf(Date);
    await expect(
      messageClient.getEntity<StandardMessageEntity>(memberRoomMessage.partitionKey, memberRoomMessage.rowKey),
    ).resolves.toMatchObject({ files: "[]", message: "" });
    expect(readBlobNamesUnder(StorageBucket.MessageAssets, `${memberRoom.id}/`)).toStrictEqual([
      otherMemberRoomAttachmentBlobName,
    ]);
    await expect(readLedgerRows(userId)).resolves.toStrictEqual([]);
    // The reaction the account held alone is gone, and its id is taken out of the reaction it shared
    expect(
      readPartitionEntities(AzureTable.MessagesMetadata, memberRoom.id).map(({ userIds }) =>
        jsonDateParse(String(userIds)),
      ),
    ).toStrictEqual([[otherUserId], [otherUserId]]);

    // The account's blob prefixes in every container the inventory keys to it
    expect(readBlobNamesUnder(StorageBucket.PublicUserAssets, `${userId}/`)).toStrictEqual([]);
    expect(readBlobNamesUnder(StorageBucket.UserAssets, `${userId}/`)).toStrictEqual([]);
    expect(readBlobNamesUnder(StorageBucket.GenshinAssets, `${userId}/`)).toStrictEqual([]);
    expect(readBlobNamesUnder(StorageBucket.ClickerAssets, `${userId}/`)).toStrictEqual([]);

    // Kept: the moderation record that names the account, and the account's activity on a resource it does not own
    expect(
      readPartitionEntities(AzureTable.ModerationLog, memberRoom.id).map(({ targetUserId }) => targetUserId),
    ).toStrictEqual([userId]);
    expect(
      readPartitionEntities(AzureTable.ResourceActivity, otherResource.id).map(
        ({ userId: activityUserId }) => activityUserId,
      ),
    ).toStrictEqual([userId]);

    // The other account: its row, its message and its charged attachment are exactly as they were
    await expect(mockDb.select().from(usersInAuth).where(eq(usersInAuth.id, otherUserId))).resolves.toStrictEqual(
      otherUserRowBefore,
    );
    await expect(readDeletedAt(otherMemberRoomMessage)).resolves.toBeNull();
    await expect(readLedgerRows(otherUserId)).resolves.toStrictEqual([
      { blobName: otherMemberRoomAttachmentBlobName, containerName: StorageBucket.MessageAssets },
    ]);
  });
});
