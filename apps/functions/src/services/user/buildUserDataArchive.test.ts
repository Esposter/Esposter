import type { Database, StandardMessageEntity } from "@esposter/db-schema";

import { getContainerClient } from "#src/services/azure/getContainerClient";
import { getTableClient } from "#src/services/azure/getTableClient";
import { createUser } from "#src/services/shared/createUser.test";
import { buildUserDataArchive } from "#src/services/user/buildUserDataArchive";
import { getResourceAssetBlobName } from "#src/services/user/getResourceAssetBlobName";
import { ArchiveLikeKind } from "#src/models/user/ArchiveLikeKind";
import {
  createMessage,
  getContentBlobName,
  getFileBlobNames,
  serializeEntity,
  writeJsonBlob,
  writeModerationLogEntry,
} from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  accountsInAuth,
  AdminActionType,
  AzureContainer,
  AzureTable,
  friendRequestsInSocial,
  friendsInSocial,
  getReverseTickedTimestamp,
  getRoomEmojiBlobName,
  getUserProfileImageBlobName,
  likesInPost,
  MessageMetadataType,
  MessageType,
  postsInPost,
  resourcePublicationsInResource,
  ResourceType,
  resourcesInResource,
  resourceWorkingAssetsInResource,
  RoomType,
  roomEmojisInMessage,
  roomsInMessage,
  searchHistoriesInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { MockBlobClient, MockContainerDatabase, MockTableDatabase } from "azure-mock";
import { strFromU8, unzipSync } from "fflate";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/azure/getContainerClient"), () => import("#src/services/azure/getContainerClient.test"));
vi.mock(import("#src/services/azure/getTableClient"), () => import("#src/services/azure/getTableClient.test"));

describe(buildUserDataArchive, () => {
  const attachmentBytes = new Uint8Array([255]);
  const content = JSON.stringify({});
  const description = "description";
  const emojiTag = "emojiTag";
  const filename = "name";
  const message = "a";
  const name = "name";
  const otherMessage = "b";
  const title = "title";

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
  });

  const readArchiveEntries = (blobName: string) => {
    const archiveBytes = MockContainerDatabase.get(AzureContainer.DataExports)?.get(blobName);
    assert.exists(archiveBytes);
    return unzipSync(archiveBytes);
  };
  const readEntryText = (entries: ReturnType<typeof unzipSync>, entryName: string) => {
    const entry = entries[entryName];
    assert.exists(entry);
    return strFromU8(entry);
  };
  const readEntryJson = (entries: ReturnType<typeof unzipSync>, entryName: string) =>
    jsonDateParse(readEntryText(entries, entryName));
  const seedAttachment = async (blobName: string) => {
    const containerClient = await getContainerClient(AzureContainer.MessageAssets);
    await containerClient.getBlockBlobClient(blobName).upload(attachmentBytes, attachmentBytes.length);
  };

  test("unzips to the entries the design lists, and holds none of another person's messages", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    await mockDb
      .insert(accountsInAuth)
      .values({ accountId: "accountId", id: crypto.randomUUID(), providerId: "providerId", userId });

    // A room the person is a member of, with their message and attachment beside the other person's message
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId },
      { roomId: room.id, userId: otherUserId },
    ]);
    const file = {
      filename,
      hasThumbnail: false,
      id: crypto.randomUUID(),
      isSpoiler: false,
      mimetype: "mimetype",
      size: attachmentBytes.length,
    };
    const messageClient = await getTableClient(AzureTable.Messages);
    const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
    await createMessage(messageClient, messageAscendingClient, {
      files: [file],
      message,
      roomId: room.id,
      type: MessageType.Message,
      userId,
    });
    await createMessage(messageClient, messageAscendingClient, {
      message: otherMessage,
      roomId: room.id,
      type: MessageType.Message,
      userId: otherUserId,
    });
    await seedAttachment(getFileBlobNames(room.id, file.id, file.filename).blobName);

    // A room the person has left, whose message is not in the archive
    const leftRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await createMessage(messageClient, messageAscendingClient, {
      message,
      roomId: leftRoom.id,
      type: MessageType.Message,
      userId,
    });

    // The account's own stores: a save, a profile image, an owned resource with a working copy and asset, and a
    // moderation record naming the person as its target
    const savesContainerClient = await getContainerClient(AzureContainer.GenshinAssets);
    await writeJsonBlob(savesContainerClient, `${userId}/save.json`, content);
    const publicContainerClient = await getContainerClient(AzureContainer.PublicUserAssets);
    await publicContainerClient
      .getBlockBlobClient(getUserProfileImageBlobName(userId))
      .upload(attachmentBytes, attachmentBytes.length);
    const resource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Blueprint, userId }).returning(),
    );
    const resourceContainerClient = await getContainerClient(AzureContainer.ResourceAssets);
    await writeJsonBlob(resourceContainerClient, getContentBlobName(resource.id), content);
    const assetHash = "0".repeat(64);
    await mockDb.insert(resourceWorkingAssetsInResource).values({ assetHash, resourceId: resource.id });
    await resourceContainerClient
      .getBlockBlobClient(getResourceAssetBlobName(resource.id, assetHash))
      .upload(attachmentBytes, attachmentBytes.length);
    await writeModerationLogEntry(await getTableClient(AzureTable.ModerationLog), {
      actorUserId: otherUserId,
      roomId: room.id,
      targetUserId: userId,
      type: AdminActionType.Warn,
    });

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    expect(Object.keys(entries).sort()).toStrictEqual(
      [
        "account.json",
        "friends.json",
        "images/ProfileImage",
        "likes.json",
        "moderation.json",
        `resources/${resource.id}/content.json`,
        `resources/${resource.id}/files/${assetHash}`,
        `resources/${resource.id}/resource.json`,
        `rooms/${room.id}/files/${file.id}/${file.filename}`,
        `rooms/${room.id}/messages.json`,
        "saves/genshin/save.json",
        "searches.json",
      ].sort(),
    );
    const messages = jsonDateParse<StandardMessageEntity[]>(readEntryText(entries, `rooms/${room.id}/messages.json`));
    expect(messages.map(({ message: text }) => text)).toStrictEqual([message]);
  });

  test("writes a person's own posts, likes and friends, leaving out other people's counts and records", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const receivedUserId = crypto.randomUUID();
    const friendUserId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb
      .insert(usersInAuth)
      .values([createUser(userId), createUser(otherUserId), createUser(receivedUserId), createUser(friendUserId)]);

    // The person's post carries a like count from others, which the archive does not write
    const post = takeOne(
      await mockDb.insert(postsInPost).values({ description, likeCount: 1, ranking: 0, title, userId }).returning(),
    );
    const otherPost = takeOne(
      await mockDb.insert(postsInPost).values({ description, ranking: 0, title, userId: otherUserId }).returning(),
    );
    // The person likes the other post, and another person's dislike of the person's own post is not theirs to list
    await mockDb.insert(likesInPost).values([
      { postId: otherPost.id, userId, value: 1 },
      { postId: post.id, userId: otherUserId, value: -1 },
    ]);

    // The person reacted in a room they are a member of, on a message whose reaction row another member shares, and
    // another member's reaction on the same message is not theirs
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId },
      { roomId: room.id, userId: otherUserId },
    ]);
    const messageRowKey = getReverseTickedTimestamp();
    const messagesMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
    // A variable, not a literal: the table's entity type has no userIds, so a literal fails the excess-property check
    const createReaction = (reactorUserIds: string[]) => {
      const reaction = {
        emojiTag,
        messageRowKey,
        partitionKey: room.id,
        rowKey: getReverseTickedTimestamp(),
        type: MessageMetadataType.Emoji,
        userIds: reactorUserIds,
      };
      return messagesMetadataClient.createEntity(serializeEntity(reaction));
    };
    await createReaction([userId, otherUserId]);
    await createReaction([otherUserId]);

    // A request the person sent, one they received, and a friendship with a fourth account
    await mockDb.insert(friendRequestsInSocial).values([
      { id: crypto.randomUUID(), receiverId: otherUserId, senderId: userId },
      { id: crypto.randomUUID(), receiverId: userId, senderId: receivedUserId },
    ]);
    await mockDb
      .insert(friendsInSocial)
      .values({ id: crypto.randomUUID(), receiverId: userId, senderId: friendUserId });

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    expect(
      Object.keys(entries)
        .filter((entryName) => entryName.startsWith("posts/"))
        .sort(),
    ).toStrictEqual([`posts/${post.id}.json`]);
    expect(readEntryJson(entries, `posts/${post.id}.json`)).toStrictEqual({
      depth: 0,
      description,
      id: post.id,
      parentId: null,
      title,
    });
    // Neither entry has a time: a post like stores none, and a reaction row's time is its first reactor's, not the
    // person's, so the exact shape leaves it out
    expect(readEntryJson(entries, "likes.json")).toStrictEqual([
      { kind: ArchiveLikeKind.Post, targetId: otherPost.id, value: 1 },
      { kind: ArchiveLikeKind.Emoji, emojiTag, roomId: room.id, targetId: messageRowKey },
    ]);
    expect(readEntryJson(entries, "friends.json")).toStrictEqual({
      friends: [{ id: friendUserId, name }],
      received: [{ id: receivedUserId, name }],
      sent: [{ id: otherUserId, name }],
    });
  });

  test("writes an owned room's record with its settings, images and emoji, and no other member's record", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ isReadOnly: true, name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId },
      { roomId: room.id, userId: otherUserId },
    ]);
    const emoji = takeOne(await mockDb.insert(roomEmojisInMessage).values({ name, roomId: room.id }).returning());
    const messageAssetsContainerClient = await getContainerClient(AzureContainer.MessageAssets);
    await messageAssetsContainerClient
      .getBlockBlobClient(getRoomEmojiBlobName(room.id, emoji.id))
      .upload(attachmentBytes, attachmentBytes.length);
    const publicContainerClient = await getContainerClient(AzureContainer.PublicUserAssets);
    await publicContainerClient
      .getBlockBlobClient(`rooms/${room.id}/ProfileImage`)
      .upload(attachmentBytes, attachmentBytes.length);

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    expect(
      Object.keys(entries)
        .filter((entryName) => entryName.startsWith(`rooms/${room.id}/`))
        .sort(),
    ).toStrictEqual(
      [
        `rooms/${room.id}/emoji/${emoji.id}`,
        `rooms/${room.id}/images/ProfileImage`,
        `rooms/${room.id}/messages.json`,
        `rooms/${room.id}/room.json`,
      ].sort(),
    );
    expect(readEntryJson(entries, `rooms/${room.id}/room.json`)).toStrictEqual({
      emoji: [{ id: emoji.id, name }],
      id: room.id,
      name,
      settings: {
        allowedMimeCategories: expect.any(Array),
        isInvitePaused: false,
        isReadOnly: true,
        maxFileSizeBytes: 0,
        slowmodeMs: 0,
      },
      topic: "",
      type: RoomType.Room,
    });
  });

  test("writes the person's own search queries with their filters, and no other person's", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId },
      { roomId: room.id, userId: otherUserId },
    ]);
    await mockDb.insert(searchHistoriesInMessage).values([
      { query: message, roomId: room.id, userId },
      { query: otherMessage, roomId: room.id, userId: otherUserId },
    ]);

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    // A search row stores no time, so the exact shape leaves one out
    expect(readEntryJson(entries, "searches.json")).toStrictEqual([{ filters: [], query: message, roomId: room.id }]);
  });

  test("writes a published resource's publication metadata, and none for a resource not published", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const publishedResource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Blueprint, userId }).returning(),
    );
    const unpublishedResource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Blueprint, userId }).returning(),
    );
    const publication = takeOne(
      await mockDb
        .insert(resourcePublicationsInResource)
        .values({ publishedContentVersion: 3, publishVersion: 2, resourceId: publishedResource.id })
        .returning(),
    );

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    // The publication is the draft version it was taken at and its time, both as the row stores them
    expect(readEntryJson(entries, `resources/${publishedResource.id}/publications.json`)).toStrictEqual({
      publishedAt: publication.publishedAt,
      publishedContentVersion: 3,
      publishVersion: 2,
    });
    expect(Object.keys(entries)).not.toContain(`resources/${unpublishedResource.id}/publications.json`);
  });

  test("reads an attachment as a stream, never into a buffer", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    const file = {
      filename,
      hasThumbnail: false,
      id: crypto.randomUUID(),
      isSpoiler: false,
      mimetype: "mimetype",
      size: attachmentBytes.length,
    };
    const attachmentBlobName = getFileBlobNames(room.id, file.id, file.filename).blobName;
    await createMessage(await getTableClient(AzureTable.Messages), await getTableClient(AzureTable.MessagesAscending), {
      files: [file],
      message,
      roomId: room.id,
      type: MessageType.Message,
      userId,
    });
    await seedAttachment(attachmentBlobName);
    const download = vi.spyOn(MockBlobClient.prototype, "download");
    const downloadToBuffer = vi.spyOn(MockBlobClient.prototype, "downloadToBuffer");

    await buildUserDataArchive(userId, blobName);

    expect(download.mock.contexts).toContainEqual(expect.objectContaining({ name: attachmentBlobName }));
    expect(downloadToBuffer.mock.contexts).not.toContainEqual(expect.objectContaining({ name: attachmentBlobName }));
  });
});
