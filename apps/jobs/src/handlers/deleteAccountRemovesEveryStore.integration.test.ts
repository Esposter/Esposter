import type { Database } from "@esposter/db-schema";

import { deleteAccountHandler } from "#src/handlers/deleteAccountHandler";
import { OBJECT_READ_PAGE_LIMIT } from "#src/services/shared/constants";
import { createRoomMessage } from "#src/services/shared/createRoomMessage.test";
import { getBucket } from "#src/services/storage/getBucket";
import { readBlobNames } from "#src/services/storage/readBlobNames.test";
import { seedBlob } from "#src/services/storage/seedBlob.test";
import { chargeStorageLedgerEntry, getContentBlobName, writeJsonBlob } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  clearMockBuckets,
  clearRoomObjectCalls,
  clearUserObjectCalls,
  createUser,
  disposeMockBuckets,
  openMockBuckets,
  roomObjectCalls,
  roomObjectReplies,
  userObjectReplies,
} from "@esposter/db-mock/workers";
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
import { generateSecretToken, hashSecretToken, NotFoundError } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/getDb"), () => ({
  getDb() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("@esposter/db-mock/workers"));
vi.mock(import("#src/services/room/getRoomObject"), () => import("@esposter/db-mock/workers"));
vi.mock(import("#src/services/user/getUserObject"), () => import("@esposter/db-mock/workers"));

const readBlobNamesUnder = async (storageBucket: StorageBucket, prefix: string) =>
  (await readBlobNames(storageBucket)).filter((blobName) => blobName.startsWith(prefix));
const readLedgerRows = (userId: string) =>
  mockDb
    .select({ blobName: storageLedgerInStorage.blobName, storageBucket: storageLedgerInStorage.storageBucket })
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
    const storedObject = await writeJsonBlob(getBucket(StorageBucket.ResourceAssets), blobName, content);
    if (!storedObject) throw new NotFoundError("ResourceAssetBlob", blobName);

    return storedObject.size;
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

  // The beforeEach answers each room and person read a sweep makes with an empty page, so a sweep ends on its first page
  beforeEach(() => {
    roomObjectReplies.set("deleteUserMessages", () => []);
    roomObjectReplies.set("deleteUserReactions", () => []);
    userObjectReplies.set("readScheduledMessages", () => []);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await clearMockBuckets();
    clearRoomObjectCalls();
    clearUserObjectCalls();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("removes every store the inventory keys to the account, keeps the activity it left on another's resource, and leaves the other account's data as it was", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    const hash = v7();
    const ownedRoomId = v7();
    const memberRoomId = v7();
    const ownedResourceId = v7();
    const ownedSurveyId = v7();
    const ownedProgramId = v7();
    const otherResourceId = v7();
    // The owned room's attachment is charged to the account. The member room holds the account's attachment, and the other
    // Account's attachment beside it
    const ownedRoomAttachmentBlobName = `${ownedRoomId}/${v7()}`;
    const memberRoomAttachmentBlobName = `${memberRoomId}/${v7()}`;
    const otherMemberRoomAttachmentBlobName = `${memberRoomId}/${v7()}`;
    const contentBlobName = getContentBlobName(ownedResourceId);
    // A version's object is stored under its resource's directory at its hash, as the snapshot store writes it
    const versionBlobName = `${ownedResourceId}/objects/${hash}`;
    const tokenHash = await hashSecretToken(generateSecretToken());
    const genshinAssetsBucket = getBucket(StorageBucket.GenshinAssets);

    // The rows go in one batch, which runs them in order, so each foreign key is written before the row that names it. The
    // Objects are written beside it: the version's row is written after its object, since the row records the size that
    // Object was stored at
    const [, contentSize, versionSize] = await Promise.all([
      mockDb.batch([
        mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]),
        mockDb.insert(accountsInAuth).values({ accountId: "accountId", id: v7(), providerId: "providerId", userId }),
        mockDb.insert(sessionsInAuth).values({ expiresAt: new Date(0), id: v7(), token: v7(), userId }),
        mockDb.insert(apiKeysInAuth).values({ id: v7(), key: v7(), referenceId: userId }),
        // The owned room, and a room the account is a member of but does not own
        mockDb.insert(roomsInMessage).values([
          { id: ownedRoomId, name, userId },
          { id: memberRoomId, name, userId: otherUserId },
        ]),
        mockDb.insert(usersToRoomsInMessage).values([
          { roomId: ownedRoomId, userId },
          { roomId: memberRoomId, userId },
          { roomId: memberRoomId, userId: otherUserId },
        ]),
        // The moderation record names the account in a room the account does not own. Its target is a foreign key with a
        // Cascade, so it goes with the account's row. The account's own action against the other account, in the same room,
        // Is kept with its author blanked
        mockDb.insert(moderationLogsInMessage).values([
          { actorUserId: otherUserId, roomId: memberRoomId, targetUserId: userId, type: AdminActionType.Warn },
          { actorUserId: userId, roomId: memberRoomId, targetUserId: otherUserId, type: AdminActionType.Warn },
        ]),
        // The owned resource with its working copy and activity trail, the owned survey and program with a row each that
        // Belongs to it, and a resource the account does not own with the account's own activity on it, which is kept
        mockDb.insert(resourcesInResource).values([
          { id: ownedResourceId, name, type: ResourceType.Note, userId },
          { id: ownedSurveyId, name, type: ResourceType.Survey, userId },
          { id: ownedProgramId, name, type: ResourceType.Program, userId },
          { id: otherResourceId, name, type: ResourceType.Note, userId: otherUserId },
        ]),
        mockDb.insert(resourceActivitiesInResource).values([
          { activityType: ResourceActivityType.Created, resourceId: ownedResourceId, userId },
          { activityType: ResourceActivityType.ContentSaved, resourceId: otherResourceId, userId },
        ]),
        mockDb.insert(surveyResponsesInResource).values({ resourceId: ownedSurveyId }),
        mockDb
          .insert(programParticipantsInResource)
          .values({ keyValue: v7(), publicId: v7(), resourceId: ownedProgramId, tokenHash }),
      ]),
      writeResourceAssetJsonBlob(contentBlobName),
      writeResourceAssetJsonBlob(versionBlobName),
      seedBlob(StorageBucket.PublicUserAssets, `rooms/${ownedRoomId}/ProfileImage`),
      seedBlob(StorageBucket.MessageAssets, ownedRoomAttachmentBlobName),
      seedBlob(StorageBucket.MessageAssets, memberRoomAttachmentBlobName),
      seedBlob(StorageBucket.MessageAssets, otherMemberRoomAttachmentBlobName),
      // The account's own blob directories
      seedBlob(StorageBucket.PublicUserAssets, getUserProfileImageBlobName(userId)),
      seedBlob(StorageBucket.UserAssets, `${userId}/CallBackground/0`),
      writeJsonBlob(genshinAssetsBucket, getSaveBlobName(userId), content),
      seedBlob(StorageBucket.ClickerAssets, getSaveBlobName(userId)),
      seedBlob(StorageBucket.UserAssets, getSaveBlobName(userId)),
    ]);
    // The version's row, and then each charged blob's ledger row, which needs its user's row the batch wrote
    await mockDb
      .insert(resourceVersionsInResource)
      .values({
        channel: SnapshotChannel.Published,
        hash,
        plaintextBytes: versionSize,
        resourceId: ownedResourceId,
        storedBytes: versionSize,
        version: 0,
      });
    await chargeStorageLedgerEntry(
      mockDb,
      userId,
      StorageBucket.MessageAssets,
      ownedRoomAttachmentBlobName,
      countedBytes,
    );
    await chargeStorageLedgerEntry(
      mockDb,
      userId,
      StorageBucket.MessageAssets,
      memberRoomAttachmentBlobName,
      countedBytes,
    );
    await chargeStorageLedgerEntry(
      mockDb,
      otherUserId,
      StorageBucket.MessageAssets,
      otherMemberRoomAttachmentBlobName,
      countedBytes,
    );
    await chargeStorageLedgerEntry(mockDb, userId, StorageBucket.ResourceAssets, contentBlobName, contentSize);
    await chargeStorageLedgerEntry(mockDb, userId, StorageBucket.ResourceAssets, versionBlobName, versionSize);

    const otherUserRowBefore = await mockDb.select().from(usersInAuth).where(eq(usersInAuth.id, otherUserId));
    // Each seeded row is present before the deletion, so the empty checks below cannot pass vacuously
    await expect(readSurveyResponseRows(ownedSurveyId)).resolves.toHaveLength(1);
    await expect(readProgramParticipantRows(ownedProgramId)).resolves.toHaveLength(1);
    await expect(readApiKeyRows(userId)).resolves.toHaveLength(1);

    // The member room's erase answers one of the account's messages, and the message carries one file
    const erasedMessage = createRoomMessage({
      files: [{ filename: "", hasThumbnail: false, id: v7(), isSpoiler: false, mimetype: "", size: 0 }],
      id: 1,
      message: "message",
      userId,
    });
    roomObjectReplies.set("deleteUserMessages", () => [erasedMessage]);

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
        .where(eq(usersToRoomsInMessage.roomId, ownedRoomId)),
    ).resolves.toStrictEqual([]);
    await expect(readBlobNamesUnder(StorageBucket.PublicUserAssets, `rooms/${ownedRoomId}/`)).resolves.toStrictEqual(
      [],
    );
    await expect(readBlobNamesUnder(StorageBucket.MessageAssets, `${ownedRoomId}/`)).resolves.toStrictEqual([]);

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
        .where(eq(resourceVersionsInResource.resourceId, ownedResourceId)),
    ).resolves.toStrictEqual([]);
    await expect(readBlobNamesUnder(StorageBucket.ResourceAssets, `${ownedResourceId}/`)).resolves.toStrictEqual([]);
    await expect(readResourceActivityRows(ownedResourceId)).resolves.toStrictEqual([]);

    // The owned survey's responses and the owned program's participants go with their resources
    // The API key goes with the user row
    await expect(readSurveyResponseRows(ownedSurveyId)).resolves.toStrictEqual([]);
    await expect(readProgramParticipantRows(ownedProgramId)).resolves.toStrictEqual([]);
    await expect(readApiKeyRows(userId)).resolves.toStrictEqual([]);

    // The account's charged attachment in the room it is a member of is gone, and the other account's stays as it was
    await expect(readBlobNamesUnder(StorageBucket.MessageAssets, `${memberRoomId}/`)).resolves.toStrictEqual([
      otherMemberRoomAttachmentBlobName,
    ]);
    await expect(readLedgerRows(userId)).resolves.toStrictEqual([]);

    // The rooms are asked in the order the sweep runs. The owned room is emptied, and sends no notice of its own.
    // The member room drops the account's messages and reactions, then the account, and tells its online members
    // The leave's payload is the tombstone the erase wrote at the clock's time, which the erase job's own suite pins exactly
    const leaveCall = roomObjectCalls.find(({ method }) => method === "notifyOnlineMembers");
    expect(roomObjectCalls).toStrictEqual([
      { args: [[userId]], method: "deleteAll", objectId: ownedRoomId },
      {
        args: [{ after: undefined, limit: OBJECT_READ_PAGE_LIMIT, userId }],
        method: "deleteUserMessages",
        objectId: memberRoomId,
      },
      {
        args: [{ after: undefined, limit: OBJECT_READ_PAGE_LIMIT, userId }],
        method: "deleteUserReactions",
        objectId: memberRoomId,
      },
      { args: [userId], method: "removeMember", objectId: memberRoomId },
      leaveCall,
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
        .where(eq(moderationLogsInMessage.roomId, memberRoomId)),
    ).resolves.toStrictEqual([{ actorUserId: null, targetUserId: otherUserId }]);
    await expect(
      mockDb
        .select({ userId: resourceActivitiesInResource.userId })
        .from(resourceActivitiesInResource)
        .where(eq(resourceActivitiesInResource.resourceId, otherResourceId)),
    ).resolves.toStrictEqual([{ userId: null }]);

    // The other account: its row and its charged attachment are exactly as they were
    await expect(mockDb.select().from(usersInAuth).where(eq(usersInAuth.id, otherUserId))).resolves.toStrictEqual(
      otherUserRowBefore,
    );
    await expect(readLedgerRows(otherUserId)).resolves.toStrictEqual([
      { blobName: otherMemberRoomAttachmentBlobName, storageBucket: StorageBucket.MessageAssets },
    ]);
  });
});
