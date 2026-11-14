import type { Database } from "@esposter/db-schema";

import { deleteAccountHandler } from "#src/handlers/deleteAccountHandler";
import { readBlobNames } from "#src/services/azure/readBlobNames.test";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { clearRoomObjectCalls, roomObjectCalls, roomObjectReplies } from "#src/services/room/getRoomObject.test";
import { createUser } from "#src/services/shared/createUser.test";
import { getBucket } from "#src/services/storage/getBucket";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { chargeStorageLedgerEntry, getContentBlobName, writeJsonBlob } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  accountsInAuth,
  AdminActionType,
  apiKeysInAuth,
  getSaveBlobName,
  getUserProfileImageBlobName,
  moderationLogsInMessage,
  programParticipantsInResource,
  resourceActivitiesInResource,
  ResourceActivityType,
  resourcesInResource,
  ResourceType,
  resourceVersionsInResource,
  roomsInMessage,
  sessionsInAuth,
  SnapshotChannel,
  StorageBucket,
  storageLedgerInStorage,
  surveyResponsesInResource,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { generateSecretToken, hashSecretToken, NotFoundError, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));
vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));

const readBlobNamesUnder = async (containerName: StorageBucket, prefix: string) =>
  (await readBlobNames(containerName)).filter((blobName) => blobName.startsWith(prefix));
const readLedgerRows = (userId: string) =>
  mockDb
    .select({ blobName: storageLedgerInStorage.blobName, containerName: storageLedgerInStorage.containerName })
    .from(storageLedgerInStorage)
    .where(eq(storageLedgerInStorage.userId, userId));
const readUserRows = (userId: string) =>
  mockDb.select({ id: usersInAuth.id }).from(usersInAuth).where(eq(usersInAuth.id, userId));
const readApiKeyRows = (userId: string) =>
  mockDb.select({ id: apiKeysInAuth.id }).from(apiKeysInAuth).where(eq(apiKeysInAuth.referenceId, userId));
const readResourceActivityRows = (resourceId: string) =>
  mockDb
    .select({ id: resourceActivitiesInResource.id })
    .from(resourceActivitiesInResource)
    .where(eq(resourceActivitiesInResource.resourceId, resourceId));
const readProgramParticipantRows = (resourceId: string) =>
  mockDb
    .select({ id: programParticipantsInResource.id })
    .from(programParticipantsInResource)
    .where(eq(programParticipantsInResource.resourceId, resourceId));
const readSurveyResponseRows = (resourceId: string) =>
  mockDb
    .select({ id: surveyResponsesInResource.id })
    .from(surveyResponsesInResource)
    .where(eq(surveyResponsesInResource.resourceId, resourceId));
describe(deleteAccountHandler, () => {
  const content = JSON.stringify({});
  // The blob is written with no condition, so the store returns the object it wrote, and its size is what is charged
  const writeResourceAssetJsonBlob = async (blobName: string): Promise<number> => {
    const object = await writeJsonBlob(getBucket(StorageBucket.ResourceAssets), blobName, content);
    if (!object) throw new NotFoundError("ResourceAssetBlob", blobName);

    return object.size;
  };
  const countedBytes = 1;
  const name = "name";

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
    await clearMockBuckets();
    clearRoomObjectCalls();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  const seedChargedBlob = async (userId: string, containerName: StorageBucket, blobName: string) => {
    await seedBlob(containerName, blobName);
    await chargeStorageLedgerEntry(mockDb, userId, containerName, blobName, countedBytes);
  };

  test("removes every store the inventory keys to the account, keeps the activity it left on another's resource, and leaves the other account's data as it was", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    const hash = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    await mockDb.insert(accountsInAuth).values({ accountId: "accountId", id: v7(), providerId: "providerId", userId });
    await mockDb.insert(sessionsInAuth).values({ expiresAt: new Date(0), id: v7(), token: v7(), userId });

    // The account's owned room, with the account's membership and a profile image. The room's attachment is charged to
    // The account
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const ownedRoomAttachmentBlobName = `${ownedRoom.id}/${v7()}`;
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: ownedRoom.id, userId });
    await seedBlob(StorageBucket.PublicUserAssets, `rooms/${ownedRoom.id}/ProfileImage`);
    await seedChargedBlob(userId, StorageBucket.MessageAssets, ownedRoomAttachmentBlobName);

    // A room the account is a member of but does not own, with the account's charged attachment, and the other
    // Account's attachment beside it
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: memberRoom.id, userId },
      { roomId: memberRoom.id, userId: otherUserId },
    ]);
    const memberRoomAttachmentBlobName = `${memberRoom.id}/${v7()}`;
    const otherMemberRoomAttachmentBlobName = `${memberRoom.id}/${v7()}`;
    await seedChargedBlob(userId, StorageBucket.MessageAssets, memberRoomAttachmentBlobName);
    await seedChargedBlob(otherUserId, StorageBucket.MessageAssets, otherMemberRoomAttachmentBlobName);

    // The moderation record names the account in a room the account does not own.
    // Its target is a foreign key with a cascade, so it goes with the account's row
    await mockDb
      .insert(moderationLogsInMessage)
      .values({ actorUserId: otherUserId, roomId: memberRoom.id, targetUserId: userId, type: AdminActionType.Warn });
    // The account's own action against the other account, in the same room, is kept with its author blanked
    await mockDb
      .insert(moderationLogsInMessage)
      .values({ actorUserId: userId, roomId: memberRoom.id, targetUserId: otherUserId, type: AdminActionType.Warn });

    // The account's owned resource, with a working copy, a version and its activity trail
    const ownedResource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Note, userId }).returning(),
    );
    const contentBlobName = getContentBlobName(ownedResource.id);
    const contentSize = await writeResourceAssetJsonBlob(contentBlobName);
    await chargeStorageLedgerEntry(mockDb, userId, StorageBucket.ResourceAssets, contentBlobName, contentSize);
    // A version's object is stored under its resource's directory at its hash, as the snapshot store writes it
    const versionBlobName = `${ownedResource.id}/objects/${hash}`;
    const versionSize = await writeResourceAssetJsonBlob(versionBlobName);
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
    await mockDb
      .insert(resourceActivitiesInResource)
      .values({ activityType: ResourceActivityType.Created, resourceId: ownedResource.id, userId });

    // The account's owned survey and program, each with a row that belongs to it, and an API key.
    // The user row's cascade takes the API key
    const ownedSurvey = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Survey, userId }).returning(),
    );
    await mockDb.insert(surveyResponsesInResource).values({ resourceId: ownedSurvey.id });
    const ownedProgram = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Program, userId }).returning(),
    );
    await mockDb
      .insert(programParticipantsInResource)
      .values({
        keyValue: v7(),
        publicId: v7(),
        resourceId: ownedProgram.id,
        tokenHash: await hashSecretToken(generateSecretToken()),
      });
    await mockDb.insert(apiKeysInAuth).values({ id: v7(), key: v7(), referenceId: userId });

    // A resource the account does not own, with the account's own activity on it, which is kept
    const otherResource = takeOne(
      await mockDb
        .insert(resourcesInResource)
        .values({ name, type: ResourceType.Note, userId: otherUserId })
        .returning(),
    );
    await mockDb
      .insert(resourceActivitiesInResource)
      .values({ activityType: ResourceActivityType.ContentSaved, resourceId: otherResource.id, userId });

    // The account's own blob directories
    await seedBlob(StorageBucket.PublicUserAssets, getUserProfileImageBlobName(userId));
    await seedBlob(StorageBucket.UserAssets, `${userId}/CallBackground/0`);
    const genshinAssetsBucket = getBucket(StorageBucket.GenshinAssets);
    await writeJsonBlob(genshinAssetsBucket, getSaveBlobName(userId), content);
    await seedBlob(StorageBucket.ClickerAssets, getSaveBlobName(userId));
    await seedBlob(StorageBucket.UserAssets, getSaveBlobName(userId));

    const otherUserRowBefore = await mockDb.select().from(usersInAuth).where(eq(usersInAuth.id, otherUserId));
    // Each seeded row is present before the deletion, so the empty checks below cannot pass vacuously
    await expect(readSurveyResponseRows(ownedSurvey.id)).resolves.toHaveLength(1);
    await expect(readProgramParticipantRows(ownedProgram.id)).resolves.toHaveLength(1);
    await expect(readApiKeyRows(userId)).resolves.toHaveLength(1);

    // The member room answers the sweep's two reads. The account's erased message carries one file.
    // It has no scheduled message left for the sweep to delete
    roomObjectReplies.set("deleteUserMessages", () => [
      { files: [{ filename: "", hasThumbnail: false, id: v7(), isSpoiler: false, mimetype: "", size: 0 }] },
    ]);
    roomObjectReplies.set("readScheduledMessages", () => []);

    await deleteAccountHandler({ userId });

    // The user row is last, and the sign-in rows that cascade from it go with it
    await expect(readUserRows(userId)).resolves.toStrictEqual([]);
    await expect(
      mockDb.select({ id: accountsInAuth.id }).from(accountsInAuth).where(eq(accountsInAuth.userId, userId)),
    ).resolves.toStrictEqual([]);
    await expect(
      mockDb.select({ id: sessionsInAuth.id }).from(sessionsInAuth).where(eq(sessionsInAuth.userId, userId)),
    ).resolves.toStrictEqual([]);

    // The owned room's row, its memberships, its profile image and its attachment
    await expect(
      mockDb.select({ id: roomsInMessage.id }).from(roomsInMessage).where(eq(roomsInMessage.userId, userId)),
    ).resolves.toStrictEqual([]);
    await expect(
      mockDb
        .select({ roomId: usersToRoomsInMessage.roomId })
        .from(usersToRoomsInMessage)
        .where(eq(usersToRoomsInMessage.roomId, ownedRoom.id)),
    ).resolves.toStrictEqual([]);
    await expect(readBlobNamesUnder(StorageBucket.PublicUserAssets, `rooms/${ownedRoom.id}/`)).resolves.toStrictEqual(
      [],
    );
    await expect(readBlobNamesUnder(StorageBucket.MessageAssets, `${ownedRoom.id}/`)).resolves.toStrictEqual([]);

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
    await expect(readBlobNamesUnder(StorageBucket.ResourceAssets, `${ownedResource.id}/`)).resolves.toStrictEqual([]);
    await expect(readResourceActivityRows(ownedResource.id)).resolves.toStrictEqual([]);

    // The owned survey's responses and the owned program's participants go with their resources
    // The API key goes with the user row
    await expect(readSurveyResponseRows(ownedSurvey.id)).resolves.toStrictEqual([]);
    await expect(readProgramParticipantRows(ownedProgram.id)).resolves.toStrictEqual([]);
    await expect(readApiKeyRows(userId)).resolves.toStrictEqual([]);

    // The account's charged attachment in the room it is a member of is gone, and the other account's stays as it was
    await expect(readBlobNamesUnder(StorageBucket.MessageAssets, `${memberRoom.id}/`)).resolves.toStrictEqual([
      otherMemberRoomAttachmentBlobName,
    ]);
    await expect(readLedgerRows(userId)).resolves.toStrictEqual([]);

    // The rooms are asked in the order the sweep runs. The owned room is told its online members, then emptied.
    // The member room drops the account's messages and reactions, then the account, and tells its online members
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

    // The account's blob prefixes in every container the inventory keys to it
    await expect(readBlobNamesUnder(StorageBucket.PublicUserAssets, `${userId}/`)).resolves.toStrictEqual([]);
    await expect(readBlobNamesUnder(StorageBucket.UserAssets, `${userId}/`)).resolves.toStrictEqual([]);
    await expect(readBlobNamesUnder(StorageBucket.GenshinAssets, `${userId}/`)).resolves.toStrictEqual([]);
    await expect(readBlobNamesUnder(StorageBucket.ClickerAssets, `${userId}/`)).resolves.toStrictEqual([]);

    // The moderation record that names the account went with the account's row.
    // The account's activity on a resource it does not own is kept.
    // Its author is cleared, since the trail outlives the person who wrote it
    await expect(
      mockDb
        .select({ id: moderationLogsInMessage.id })
        .from(moderationLogsInMessage)
        .where(eq(moderationLogsInMessage.targetUserId, userId)),
    ).resolves.toStrictEqual([]);
    await expect(
      mockDb
        .select({
          actorUserId: moderationLogsInMessage.actorUserId,
          targetUserId: moderationLogsInMessage.targetUserId,
        })
        .from(moderationLogsInMessage)
        .where(eq(moderationLogsInMessage.roomId, memberRoom.id)),
    ).resolves.toStrictEqual([{ actorUserId: null, targetUserId: otherUserId }]);
    await expect(
      mockDb
        .select({ userId: resourceActivitiesInResource.userId })
        .from(resourceActivitiesInResource)
        .where(eq(resourceActivitiesInResource.resourceId, otherResource.id)),
    ).resolves.toStrictEqual([{ userId: null }]);

    // The other account: its row and its charged attachment are exactly as they were
    await expect(mockDb.select().from(usersInAuth).where(eq(usersInAuth.id, otherUserId))).resolves.toStrictEqual(
      otherUserRowBefore,
    );
    await expect(readLedgerRows(otherUserId)).resolves.toStrictEqual([
      { blobName: otherMemberRoomAttachmentBlobName, containerName: StorageBucket.MessageAssets },
    ]);
  });
});
