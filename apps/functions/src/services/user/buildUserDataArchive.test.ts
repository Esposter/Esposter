import type { Database, StandardMessageEntity } from "@esposter/db-schema";

import { ArchiveLikeKind } from "#src/models/user/ArchiveLikeKind";
import { getContainerClient } from "#src/services/azure/getContainerClient";
import { getTableClient } from "#src/services/azure/getTableClient";
import { createUser } from "#src/services/shared/createUser.test";
import { buildUserDataArchive } from "#src/services/user/buildUserDataArchive";
import { getResourceAssetBlobName } from "#src/services/user/getResourceAssetBlobName";
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
  achievementsInAchievement,
  AdminActionType,
  AppNotificationType,
  AzureContainer,
  AzureTable,
  blocksInSocial,
  bookmarksInApp,
  callSessionsInMessage,
  EmailAchievementName,
  friendRequestsInSocial,
  friendsInSocial,
  getReverseTickedTimestamp,
  getRoomEmojiBlobName,
  getUserProfileImageBlobName,
  likesInPost,
  MessageMetadataType,
  MessageType,
  NotificationSeverity,
  notificationsInNotification,
  postsInPost,
  resourceAccessesInResource,
  resourceFavoritesInResource,
  resourceLinksInResource,
  ResourceLinkType,
  resourcePublicationsInResource,
  resourcesInResource,
  ResourceType,
  resourceWorkingAssetsInResource,
  roomEmojisInMessage,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
  searchHistoriesInMessage,
  threadFollowsInMessage,
  userAchievementsInAchievement,
  userSettingsInMessage,
  usersInAuth,
  userStatusesInMessage,
  usersToRoomRolesInMessage,
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

describe(buildUserDataArchive, () => {
  const attachmentBytes = new Uint8Array([255]);
  const callId = "callsession1";
  const content = JSON.stringify({});
  const description = "description";
  const emojiTag = "emojiTag";
  const filename = "name";
  const message = "a";
  const name = "name";
  const otherCallId = "callsession2";
  const otherMessage = "b";
  const path = "path";
  const title = "title";
  const file = {
    filename,
    hasThumbnail: false,
    id: crypto.randomUUID(),
    isSpoiler: false,
    mimetype: "mimetype",
    size: attachmentBytes.length,
  };

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    MockContainerDatabase.clear();
    MockTableDatabase.clear();
  });

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
    // Moderation record naming the person as its target
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

    expect(Object.keys(entries).toSorted()).toStrictEqual(
      [
        "account.json",
        "accesses.json",
        "calls.json",
        "favorites.json",
        "follows.json",
        "friends.json",
        "images/ProfileImage",
        "memberships.json",
        "likes.json",
        "moderation-actions.json",
        "moderation.json",
        `resources/${resource.id}/content.json`,
        `resources/${resource.id}/files/${assetHash}`,
        `resources/${resource.id}/resource.json`,
        `rooms/${room.id}/files/${file.id}/${file.filename}`,
        `rooms/${room.id}/messages.json`,
        "saves/genshin/save.json",
        "searches.json",
      ].toSorted(),
    );
    const messages = jsonDateParse<StandardMessageEntity[]>(readEntryText(entries, `rooms/${room.id}/messages.json`));
    expect(messages.map(({ message: text }) => text)).toStrictEqual([message]);
  });

  test("writes the account's rows without their update or delete times, and a creation time only where a row is the person's act", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    const user = takeOne(await mockDb.insert(usersInAuth).values(createUser(userId)).returning());
    await mockDb.insert(usersInAuth).values(createUser(otherUserId));
    const block = takeOne(
      await mockDb.insert(blocksInSocial).values({ blockedId: otherUserId, blockerId: userId }).returning(),
    );
    const bookmark = takeOne(await mockDb.insert(bookmarksInApp).values({ path, title, userId }).returning());
    // The notification, the achievement, the settings and the status are written by the system or are the account's
    // Current state, so their rows carry no creation time
    await mockDb
      .insert(notificationsInNotification)
      .values({ severity: NotificationSeverity.Info, title, type: AppNotificationType.Message, userId });
    const achievement = takeOne(
      await mockDb.insert(achievementsInAchievement).values({ name: EmailAchievementName.EmailMarketer }).returning(),
    );
    await mockDb.insert(userAchievementsInAchievement).values({ achievementId: achievement.id, amount: 1, userId });
    await mockDb.insert(userSettingsInMessage).values({ userId });
    await mockDb.insert(userStatusesInMessage).values({ userId });

    await buildUserDataArchive(userId, blobName);
    const account = readEntryJson(readArchiveEntries(blobName), "account.json");

    expect(account.user).toStrictEqual({
      biography: user.biography,
      createdAt: user.createdAt,
      email: user.email,
      emailVerified: user.emailVerified,
      id: user.id,
      image: user.image,
      name: user.name,
      storageBytesUsed: user.storageBytesUsed,
      storageTier: user.storageTier,
    });
    expect(account.blocks).toStrictEqual([{ blockedId: otherUserId, blockerId: userId, createdAt: block.createdAt }]);
    expect(account.bookmarks).toStrictEqual([
      { createdAt: bookmark.createdAt, path, resourceType: null, title, userId },
    ]);
    for (const rows of [account.notifications, account.achievements, account.settings, account.statuses]) {
      expect(rows).toHaveLength(1);
      expect(rows[0]).not.toHaveProperty("createdAt");
      expect(rows[0]).not.toHaveProperty("updatedAt");
      expect(rows[0]).not.toHaveProperty("deletedAt");
    }
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
    const like = takeOne(
      await mockDb.insert(likesInPost).values({ postId: otherPost.id, userId, value: 1 }).returning(),
    );
    await mockDb.insert(likesInPost).values({ postId: post.id, userId: otherUserId, value: -1 });

    // The person reacted in a room they are a member of, on a message whose reaction row another member shares, and
    // Another member's reaction on the same message is not theirs
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
    const sentRequest = takeOne(
      await mockDb
        .insert(friendRequestsInSocial)
        .values({ id: crypto.randomUUID(), receiverId: otherUserId, senderId: userId })
        .returning(),
    );
    await mockDb
      .insert(friendRequestsInSocial)
      .values({ id: crypto.randomUUID(), receiverId: userId, senderId: receivedUserId });
    await mockDb
      .insert(friendsInSocial)
      .values({ id: crypto.randomUUID(), receiverId: userId, senderId: friendUserId });

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    expect(
      Object.keys(entries)
        .filter((entryName) => entryName.startsWith("posts/"))
        .toSorted(),
    ).toStrictEqual([`posts/${post.id}.json`]);
    expect(readEntryJson(entries, `posts/${post.id}.json`)).toStrictEqual({
      createdAt: post.createdAt,
      depth: 0,
      description,
      id: post.id,
      parentId: null,
      title,
    });
    // A post like carries the time it was made. A reaction carries none: its row is shared by its reactors, so its time is
    // The first reactor's, not the person's, and the exact shape leaves it out
    expect(readEntryJson(entries, "likes.json")).toStrictEqual([
      { createdAt: like.createdAt, kind: ArchiveLikeKind.Post, targetId: otherPost.id, value: 1 },
      { emojiTag, kind: ArchiveLikeKind.Emoji, roomId: room.id, targetId: messageRowKey },
    ]);
    // A request the person sent carries the time it was sent. One they received is the sender's act, and a friendship is one
    // Row for the pair, made when the receiver accepted it, so neither carries a time
    expect(readEntryJson(entries, "friends.json")).toStrictEqual({
      friends: [{ id: friendUserId, name }],
      received: [{ id: receivedUserId, name }],
      sent: [{ createdAt: sentRequest.createdAt, id: otherUserId, name }],
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
        .toSorted(),
    ).toStrictEqual(
      [
        `rooms/${room.id}/emoji/${emoji.id}`,
        `rooms/${room.id}/images/ProfileImage`,
        `rooms/${room.id}/messages.json`,
        `rooms/${room.id}/room.json`,
      ].toSorted(),
    );
    expect(readEntryJson(entries, `rooms/${room.id}/room.json`)).toStrictEqual({
      createdAt: room.createdAt,
      emoji: [{ id: emoji.id, name }],
      id: room.id,
      name,
      settings: {
        allowedMimeCategories: room.allowedMimeCategories,
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
    const search = takeOne(
      await mockDb.insert(searchHistoriesInMessage).values({ query: message, roomId: room.id, userId }).returning(),
    );
    await mockDb.insert(searchHistoriesInMessage).values({ query: otherMessage, roomId: room.id, userId: otherUserId });

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    // A search carries the time it ran
    expect(readEntryJson(entries, "searches.json")).toStrictEqual([
      { createdAt: search.createdAt, filters: [], query: message, roomId: room.id },
    ]);
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

    // The publication is the draft version it was taken at, the time it began, which a republish does not move, and the time
    // It was last published, all as the row stores them
    expect(readEntryJson(entries, `resources/${publishedResource.id}/publications.json`)).toStrictEqual({
      createdAt: publication.createdAt,
      publishedAt: publication.publishedAt,
      publishedContentVersion: 3,
      publishVersion: 2,
    });
    expect(Object.keys(entries)).not.toContain(`resources/${unpublishedResource.id}/publications.json`);
  });

  test("writes an owned resource's own fields and its creation time, and none of its bookkeeping", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const resource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Blueprint, userId }).returning(),
    );

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    // The hashes, sizes and revision counters are the store's bookkeeping, and the update and delete times are not the
    // Person's, so the record holds what the person wrote and when it was created
    expect(readEntryJson(entries, `resources/${resource.id}/resource.json`)).toStrictEqual({
      contentVersion: 0,
      createdAt: resource.createdAt,
      id: resource.id,
      name,
      tags: {},
      type: ResourceType.Blueprint,
    });
  });

  test("writes an owned resource's link records as stored, and none for a resource with no links", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const linkingResource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Blueprint, userId }).returning(),
    );
    const linkedResource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Blueprint, userId }).returning(),
    );
    const unlinkedResource = takeOne(
      await mockDb.insert(resourcesInResource).values({ name, type: ResourceType.Blueprint, userId }).returning(),
    );
    await mockDb
      .insert(resourceLinksInResource)
      .values({ sourceId: linkingResource.id, targetId: linkedResource.id, type: ResourceLinkType.Email });

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    // A link holds no token, so nothing is withheld from it, and the record is written as the row stores it
    expect(readEntryJson(entries, `resources/${linkingResource.id}/links.json`)).toStrictEqual([
      { sourceId: linkingResource.id, targetId: linkedResource.id, type: ResourceLinkType.Email },
    ]);
    expect(Object.keys(entries)).not.toContain(`resources/${unlinkedResource.id}/links.json`);
  });

  test("writes the moderation actions the person took in rooms they own, and no other moderator's", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const otherRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());

    // The action the person took in the room they own, at a fixed time, beside another moderator's action there against
    // The person, and one the person took in a room they do not own
    const actionTime = new Date(
      Temporal.Duration.from({ hours: 1, seconds: 2, milliseconds: 3 }).total("milliseconds"),
    );
    const moderationLogClient = await getTableClient(AzureTable.ModerationLog);
    const actions = [
      {
        actorUserId: userId,
        partitionKey: ownedRoom.id,
        rowKey: getReverseTickedTimestamp((BigInt(actionTime.getTime()) * 10n ** 6n).toString()),
        targetUserId: otherUserId,
        type: AdminActionType.Warn,
      },
      {
        actorUserId: otherUserId,
        partitionKey: ownedRoom.id,
        rowKey: getReverseTickedTimestamp(),
        targetUserId: userId,
        type: AdminActionType.Warn,
      },
      {
        actorUserId: userId,
        partitionKey: otherRoom.id,
        rowKey: getReverseTickedTimestamp(),
        targetUserId: otherUserId,
        type: AdminActionType.Warn,
      },
    ];
    await Promise.all(actions.map((action) => moderationLogClient.createEntity(serializeEntity(action))));

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    // The action is written with its type, time and the id it was taken against, and no content of the target's
    expect(readEntryJson(entries, "moderation-actions.json")).toStrictEqual([
      { roomId: ownedRoom.id, targetUserId: otherUserId, time: actionTime, type: AdminActionType.Warn },
    ]);
  });

  test("writes the calls the person started, without their join ids, and no other person's call", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    // A room holds one call per thread, so the other person's call is in a room of their own
    const otherRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    const call = takeOne(
      await mockDb.insert(callSessionsInMessage).values({ id: callId, roomId: room.id, userId }).returning(),
    );
    await mockDb.insert(callSessionsInMessage).values({ id: otherCallId, roomId: otherRoom.id, userId: otherUserId });

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    // A call carries the time it started. Its id is the key a knocker presents to join, so the exact shape leaves it out
    expect(readEntryJson(entries, "calls.json")).toStrictEqual([
      { createdAt: call.createdAt, roomId: room.id, threadRootRowKey: "" },
    ]);
  });

  test("writes the person's own thread decisions, an unfollow included, and no other person's", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    const threadRootRowKey = getReverseTickedTimestamp();
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId },
      { roomId: room.id, userId: otherUserId },
    ]);
    // The person's unfollow is a decision they made, so its row stays; the other person's follow of the same thread is
    // Not theirs
    const follow = takeOne(
      await mockDb
        .insert(threadFollowsInMessage)
        .values({ isUnfollowed: true, roomId: room.id, threadRootRowKey, userId })
        .returning(),
    );
    await mockDb
      .insert(threadFollowsInMessage)
      .values({ isUnfollowed: false, roomId: room.id, threadRootRowKey, userId: otherUserId });

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    // A follow carries the time of the person's first decision about the thread
    expect(readEntryJson(entries, "follows.json")).toStrictEqual([
      { createdAt: follow.createdAt, isUnfollowed: true, roomId: room.id, threadRootRowKey },
    ]);
  });

  test("writes the person's memberships in rooms they do not own, with their roles, and no other member's", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    const ownedRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const role = takeOne(await mockDb.insert(roomRolesInMessage).values({ name, roomId: room.id }).returning());
    const membership = takeOne(
      await mockDb.insert(usersToRoomsInMessage).values({ displayName: name, roomId: room.id, userId }).returning(),
    );
    // The other member's row and the person's row in a room they own are not the membership written
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: room.id, userId: otherUserId },
      { roomId: ownedRoom.id, userId },
    ]);
    await mockDb.insert(usersToRoomRolesInMessage).values([
      { roleId: role.id, roomId: room.id, userId },
      { roleId: role.id, roomId: room.id, userId: otherUserId },
    ]);

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    // The membership keeps the person's own settings, the time they joined and the time they last read the room, and
    // The roles they hold there
    expect(readEntryJson(entries, "memberships.json")).toStrictEqual([
      {
        createdAt: membership.createdAt,
        displayName: membership.displayName,
        isHidden: membership.isHidden,
        lastReadAt: membership.lastReadAt,
        notificationType: membership.notificationType,
        roles: [{ id: role.id, name }],
        roomId: room.id,
      },
    ]);
  });

  test("writes the person's own favorites and accesses of a resource, and no other person's", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const resource = takeOne(
      await mockDb
        .insert(resourcesInResource)
        .values({ name, type: ResourceType.Blueprint, userId: otherUserId })
        .returning(),
    );
    const favorite = takeOne(
      await mockDb.insert(resourceFavoritesInResource).values({ resourceId: resource.id, userId }).returning(),
    );
    await mockDb.insert(resourceFavoritesInResource).values({ resourceId: resource.id, userId: otherUserId });
    const access = takeOne(
      await mockDb.insert(resourceAccessesInResource).values({ resourceId: resource.id, userId }).returning(),
    );
    await mockDb.insert(resourceAccessesInResource).values({ resourceId: resource.id, userId: otherUserId });

    await buildUserDataArchive(userId, blobName);
    const entries = readArchiveEntries(blobName);

    // A favorite carries the time it was starred. An access carries the time it was first opened, as the row stores it
    // Beside the time it was last opened
    expect(readEntryJson(entries, "favorites.json")).toStrictEqual([
      { createdAt: favorite.createdAt, resourceId: resource.id },
    ]);
    expect(readEntryJson(entries, "accesses.json")).toStrictEqual([
      { accessedAt: access.accessedAt, createdAt: access.createdAt, resourceId: resource.id },
    ]);
  });

  test("reads an attachment as a stream, never into a buffer", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const blobName = `${crypto.randomUUID()}.zip`;
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
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

    expect(download.mock.contexts.map((context) => context.name)).toContain(attachmentBlobName);
    expect(downloadToBuffer.mock.contexts.map((context) => context.name)).not.toContain(attachmentBlobName);
  });
});
