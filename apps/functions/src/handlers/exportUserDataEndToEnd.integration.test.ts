import type { Database } from "@esposter/db-schema";

import { exportUserDataHandler } from "#src/handlers/exportUserDataHandler";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { clearMockRooms, getRoomObject, openMockRooms } from "#src/services/room/getRoomObject.test";
import { createUser } from "#src/services/shared/createUser.test";
import { getBucket } from "#src/services/storage/getBucket";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { getDataExportBlobName } from "#src/services/user/getDataExportBlobName";
import { getContentBlobName, getFileBlobNames, writeJsonBlob } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  AdminActionType,
  dataExportsInUser,
  DataExportStatus,
  friendsInSocial,
  getResourceFileBlobName,
  getRoomEmojiBlobName,
  getSaveBlobName,
  getUserProfileImageBlobName,
  likesInPost,
  MessageType,
  moderationLogsInMessage,
  postsInPost,
  resourcesInResource,
  ResourceType,
  resourceWorkingAssetsInResource,
  roomEmojisInMessage,
  roomsInMessage,
  StorageBucket,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { unzipSync } from "fflate";
import { v7 } from "uuid";
import { afterAll, afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));
vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));

describe(exportUserDataHandler, () => {
  const content = JSON.stringify({});
  const description = "description";
  const filename = "filename";
  const name = "name";
  const title = "title";

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
    await clearMockBuckets();
    clearMockRooms();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("builds a requested export into an archive holding each entry the design lists, and marks it ready", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);

    // The account's own post, a like of the other person's post, and a friendship with the other person
    const post = takeOne(
      await mockDb.insert(postsInPost).values({ description, ranking: 0, title, userId }).returning(),
    );
    const otherPost = takeOne(
      await mockDb.insert(postsInPost).values({ description, ranking: 0, title, userId: otherUserId }).returning(),
    );
    await mockDb.insert(likesInPost).values({ postId: otherPost.id, userId, value: 1 });
    await mockDb.insert(friendsInSocial).values({ id: v7(), receiverId: userId, senderId: otherUserId });

    // The owned room, which the account is a member of, with its message and attachment, its emoji and its image
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    const file = { filename, hasThumbnail: false, id: v7(), isSpoiler: false, mimetype: "mimetype", size: 0 };
    await getRoomObject(room.id).createMessage(
      { files: [file], message: "message", type: MessageType.Message },
      { userId },
    );
    await seedBlob(StorageBucket.MessageAssets, getFileBlobNames(room.id, file.id, file.filename).blobName);
    const emoji = takeOne(await mockDb.insert(roomEmojisInMessage).values({ name, roomId: room.id }).returning());
    await seedBlob(StorageBucket.MessageAssets, getRoomEmojiBlobName(room.id, emoji.id));
    await seedBlob(StorageBucket.PublicUserAssets, `rooms/${room.id}/ProfileImage`);

    // The owned resource, with its working copy and the asset that copy embeds
    const resource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Blueprint, userId }).returning(),
    );
    const resourceAssetsBucket = getBucket(StorageBucket.ResourceAssets);
    await writeJsonBlob(resourceAssetsBucket, getContentBlobName(resource.id), content);
    const assetHash = "0".repeat(64);
    await mockDb.insert(resourceWorkingAssetsInResource).values({ assetHash, resourceId: resource.id });
    await seedBlob(StorageBucket.ResourceAssets, getResourceFileBlobName(resource.id, assetHash));

    // The account's profile image, a call background, its save, and a moderation record naming it as the target
    await seedBlob(StorageBucket.PublicUserAssets, getUserProfileImageBlobName(userId));
    await seedBlob(StorageBucket.UserAssets, `${userId}/CallBackground/0`);
    const genshinAssetsBucket = getBucket(StorageBucket.GenshinAssets);
    await writeJsonBlob(genshinAssetsBucket, getSaveBlobName(userId), content);
    await mockDb
      .insert(moderationLogsInMessage)
      .values({ actorUserId: otherUserId, roomId: room.id, targetUserId: userId, type: AdminActionType.Warn });

    // The request writes the queued row the web procedure writes, and the event carries its id to the handler
    const dataExportId = v7();
    await mockDb.insert(dataExportsInUser).values({ id: dataExportId, status: DataExportStatus.Queued, userId });

    await exportUserDataHandler({ dataExportId });

    const exportRow = takeOne(
      await mockDb
        .select({ blobName: dataExportsInUser.blobName, status: dataExportsInUser.status })
        .from(dataExportsInUser)
        .where(eq(dataExportsInUser.id, dataExportId)),
    );
    const archiveBucket = getBucket(StorageBucket.UserAssets);
    const archiveObject = await archiveBucket.get(getDataExportBlobName(dataExportId));
    assert.exists(archiveObject);
    const entries = unzipSync(new Uint8Array(await archiveObject.arrayBuffer()));

    expect(exportRow).toStrictEqual({ blobName: getDataExportBlobName(dataExportId), status: DataExportStatus.Ready });
    expect(Object.keys(entries).toSorted()).toStrictEqual(
      [
        "account.json",
        "accesses.json",
        "calls.json",
        "favorites.json",
        "follows.json",
        "friends.json",
        "images/CallBackground/0",
        "memberships.json",
        "images/ProfileImage",
        "likes.json",
        "moderation-actions.json",
        "moderation.json",
        `posts/${post.id}.json`,
        `resources/${resource.id}/content.json`,
        `resources/${resource.id}/files/${assetHash}`,
        `resources/${resource.id}/resource.json`,
        `rooms/${room.id}/emoji/${emoji.id}`,
        `rooms/${room.id}/files/${file.id}/${file.filename}`,
        `rooms/${room.id}/images/ProfileImage`,
        `rooms/${room.id}/messages.json`,
        `rooms/${room.id}/room.json`,
        "saves/genshin/save.json",
        "searches.json",
      ].toSorted(),
    );
  });
});
