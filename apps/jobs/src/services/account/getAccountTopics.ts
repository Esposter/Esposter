import type { Topic, UserInAuth } from "@esposter/db-schema";

import { getDb } from "#src/services/shared/db";
import { getMemberRoomIds, getPersonReaderTopics, inJsonArray } from "@esposter/db";
import {
  bookmarksInApp,
  friendsInSocial,
  getTopic,
  likesInPost,
  postsInPost,
  resourcesInResource,
  roomsInMessage,
  threadFollowsInMessage,
  TopicKind,
  webhooksInMessage,
} from "@esposter/db-schema";
import { and, eq, inArray, ne, or } from "drizzle-orm";

// The topics of every read that shows the erased person's rows, listed before any step removes them: each row that goes
// Is named here by the reads that show it. A friendship, a bookmark, a thread follow and a webhook cascade with the rows
// Beside them, and the rooms and resources the person owns cascade with everything in them
export const getAccountTopics = async (userId: UserInAuth["id"]): Promise<Topic[]> => {
  const ownedRoomIds = getDb()
    .select({ id: roomsInMessage.id })
    .from(roomsInMessage)
    .where(eq(roomsInMessage.userId, userId));
  // Read once, then bound as a JSON array: the bookmarks read and the resource topics both need the same rows. Only the
  // Bookmarks read waits on it, so the other reads run beside it
  const readOwnedResourceIds = async () =>
    (
      await getDb()
        .select({ id: resourcesInResource.id })
        .from(resourcesInResource)
        .where(eq(resourcesInResource.userId, userId))
    ).map(({ id }) => id);
  const ownedResourceIdsRead = readOwnedResourceIds();
  const readBookmarks = async () => {
    const resourceIds = await ownedResourceIdsRead;
    return getDb()
      .select({ userId: bookmarksInApp.userId })
      .from(bookmarksInApp)
      .where(
        and(
          ne(bookmarksInApp.userId, userId),
          or(inJsonArray(bookmarksInApp.resourceId, resourceIds), inArray(bookmarksInApp.roomId, ownedRoomIds)),
        ),
      );
  };
  const [readerTopics, memberRoomIds, friendships, bookmarks, threadFollows, webhooks, likes, ownedResourceIds] =
    await Promise.all([
      getPersonReaderTopics(getDb(), userId),
      getMemberRoomIds(getDb(), userId),
      getDb()
        .select({ receiverId: friendsInSocial.receiverId, senderId: friendsInSocial.senderId })
        .from(friendsInSocial)
        .where(or(eq(friendsInSocial.senderId, userId), eq(friendsInSocial.receiverId, userId))),
      readBookmarks(),
      getDb()
        .select({ roomId: threadFollowsInMessage.roomId, userId: threadFollowsInMessage.userId })
        .from(threadFollowsInMessage)
        .where(and(ne(threadFollowsInMessage.userId, userId), inArray(threadFollowsInMessage.roomId, ownedRoomIds))),
      getDb()
        .select({ roomId: webhooksInMessage.roomId })
        .from(webhooksInMessage)
        .where(eq(webhooksInMessage.creatorId, userId)),
      getDb()
        .select({ ancestorIds: postsInPost.ancestorIds, id: postsInPost.id })
        .from(likesInPost)
        .innerJoin(postsInPost, eq(postsInPost.id, likesInPost.postId))
        .where(eq(likesInPost.userId, userId)),
      ownedResourceIdsRead,
    ]);

  return [
    ...readerTopics,
    ...memberRoomIds.map((roomId) => getTopic(TopicKind.Room, roomId)),
    ...friendships.map(({ receiverId, senderId }) =>
      getTopic(TopicKind.Friend, senderId === userId ? receiverId : senderId),
    ),
    ...bookmarks.map(({ userId: bookmarkUserId }) => getTopic(TopicKind.Bookmark, bookmarkUserId)),
    ...threadFollows.map(({ userId: followerId }) => getTopic(TopicKind.ThreadFollow, followerId)),
    ...webhooks.map(({ roomId }) => getTopic(TopicKind.Webhook, roomId)),
    ...likes.flatMap(({ ancestorIds, id }) => [
      getTopic(TopicKind.Post, ancestorIds[0] ?? id),
      getTopic(TopicKind.Post, id),
    ]),
    ...ownedResourceIds.map((id) => getTopic(TopicKind.Resource, id)),
    getTopic(TopicKind.Feed, "posts"),
  ];
};
