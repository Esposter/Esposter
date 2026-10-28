import type { Database } from "@esposter/db-schema";

import { exportUserDataHandler } from "#src/handlers/exportUserDataHandler";
import { getContainerClient } from "#src/services/azure/getContainerClient";
import { getTableClient } from "#src/services/azure/getTableClient";
import { seedBlob } from "#src/services/azure/seedBlob.test";
import { createUser } from "#src/services/shared/createUser.test";
import { getDataExportBlobName } from "#src/services/user/getDataExportBlobName";
import { getResourceAssetBlobName } from "#src/services/user/getResourceAssetBlobName";
import { InvocationContext } from "@azure/functions";
import {
  createMessage,
  getContentBlobName,
  getFileBlobNames,
  writeJsonBlob,
  writeModerationLogEntry,
} from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  AdminActionType,
  AzureContainer,
  AzureTable,
  dataExportsInUser,
  DataExportStatus,
  friendsInSocial,
  getRoomEmojiBlobName,
  getSaveBlobName,
  getUserProfileImageBlobName,
  likesInPost,
  MessageType,
  postsInPost,
  resourcesInResource,
  ResourceType,
  resourceWorkingAssetsInResource,
  roomEmojisInMessage,
  roomsInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { eq } from "drizzle-orm";
import { unzipSync } from "fflate";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));
vi.mock(import("#src/services/azure/getTableClient"), () => import("#src/services/azure/getTableClient.test"));

describe(exportUserDataHandler, () => {
  const content = JSON.stringify({});
  const context = new InvocationContext({ logHandler: () => {} });
  const description = "description";
  const filename = "filename";
  const name = "name";
  const title = "title";

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
  });

  test("builds a requested export into an archive holding each entry the design lists, and marks it ready", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);

    // The account's own post, a like of the other person's post, and a friendship with the other person
    const post = takeOne(
      await mockDb.insert(postsInPost).values({ description, ranking: 0, title, userId }).returning(),
    );
    const otherPost = takeOne(
      await mockDb.insert(postsInPost).values({ description, ranking: 0, title, userId: otherUserId }).returning(),
    );
    await mockDb.insert(likesInPost).values({ postId: otherPost.id, userId, value: 1 });
    await mockDb.insert(friendsInSocial).values({ id: crypto.randomUUID(), receiverId: userId, senderId: otherUserId });

    // The owned room, which the account is a member of, with its message and attachment, its emoji and its image
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    const file = {
      filename,
      hasThumbnail: false,
      id: crypto.randomUUID(),
      isSpoiler: false,
      mimetype: "mimetype",
      size: 0,
    };
    await createMessage(await getTableClient(AzureTable.Messages), await getTableClient(AzureTable.MessagesAscending), {
      files: [file],
      message: "message",
      roomId: room.id,
      type: MessageType.Message,
      userId,
    });
    await seedBlob(AzureContainer.MessageAssets, getFileBlobNames(room.id, file.id, file.filename).blobName);
    const emoji = takeOne(await mockDb.insert(roomEmojisInMessage).values({ name, roomId: room.id }).returning());
    await seedBlob(AzureContainer.MessageAssets, getRoomEmojiBlobName(room.id, emoji.id));
    await seedBlob(AzureContainer.PublicUserAssets, `rooms/${room.id}/ProfileImage`);

    // The owned resource, with its working copy and the asset that copy embeds
    const resource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Blueprint, userId }).returning(),
    );
    await writeJsonBlob(
      await getContainerClient(AzureContainer.ResourceAssets),
      getContentBlobName(resource.id),
      content,
    );
    const assetHash = "0".repeat(64);
    await mockDb.insert(resourceWorkingAssetsInResource).values({ assetHash, resourceId: resource.id });
    await seedBlob(AzureContainer.ResourceAssets, getResourceAssetBlobName(resource.id, assetHash));

    // The account's profile image, a call background, its save, and a moderation record naming it as the target
    await seedBlob(AzureContainer.PublicUserAssets, getUserProfileImageBlobName(userId));
    await seedBlob(AzureContainer.UserAssets, `${userId}/CallBackground/0`);
    await writeJsonBlob(await getContainerClient(AzureContainer.GenshinAssets), getSaveBlobName(userId), content);
    await writeModerationLogEntry(await getTableClient(AzureTable.ModerationLog), {
      actorUserId: otherUserId,
      roomId: room.id,
      targetUserId: userId,
      type: AdminActionType.Warn,
    });

    // The request writes the queued row the web procedure writes, and the event carries its id to the handler
    const dataExportId = crypto.randomUUID();
    await mockDb.insert(dataExportsInUser).values({ id: dataExportId, status: DataExportStatus.Queued, userId });

    await exportUserDataHandler(context, { dataExportId });

    const exportRow = takeOne(
      await mockDb
        .select({ blobName: dataExportsInUser.blobName, status: dataExportsInUser.status })
        .from(dataExportsInUser)
        .where(eq(dataExportsInUser.id, dataExportId)),
    );
    const archiveBytes = MockContainerDatabase.get(AzureContainer.UserAssets)?.get(getDataExportBlobName(dataExportId));
    assert.exists(archiveBytes);
    const entries = unzipSync(archiveBytes);

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
