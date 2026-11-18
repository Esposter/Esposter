import type { Topic, UserInAuth } from "@esposter/db-schema";

import { db } from "#src/services/shared/db";
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
  const ownedRoomIds = db
    .select({ id: roomsInMessage.id })
    .from(roomsInMessage)
    .where(eq(roomsInMessage.userId, userId));
  // Read once, then bound as a JSON array: the bookmarks read and the resource topics both need the same rows
  const ownedResourceIds = (
    await db
      .select({ id: resourcesInResource.id })
      .from(resourcesInResource)
      .where(eq(resourcesInResource.userId, userId))
  ).map(({ id }) => id);
  const [readerTopics, memberRoomIds, friendships, bookmarks, threadFollows, webhooks, likes] = await Promise.all([
    getPersonReaderTopics(db, userId),
    getMemberRoomIds(db, userId),
    db
      .select({ receiverId: friendsInSocial.receiverId, senderId: friendsInSocial.senderId })
      .from(friendsInSocial)
      .where(or(eq(friendsInSocial.senderId, userId), eq(friendsInSocial.receiverId, userId))),
    db
      .select({ userId: bookmarksInApp.userId })
      .from(bookmarksInApp)
      .where(
        and(
          ne(bookmarksInApp.userId, userId),
          or(inJsonArray(bookmarksInApp.resourceId, ownedResourceIds), inArray(bookmarksInApp.roomId, ownedRoomIds)),
        ),
      ),
    db
      .select({ roomId: threadFollowsInMessage.roomId, userId: threadFollowsInMessage.userId })
      .from(threadFollowsInMessage)
      .where(and(ne(threadFollowsInMessage.userId, userId), inArray(threadFollowsInMessage.roomId, ownedRoomIds))),
    db
      .select({ roomId: webhooksInMessage.roomId })
      .from(webhooksInMessage)
      .where(eq(webhooksInMessage.creatorId, userId)),
    db
      .select({ ancestorIds: postsInPost.ancestorIds, id: postsInPost.id })
      .from(likesInPost)
      .innerJoin(postsInPost, eq(postsInPost.id, likesInPost.postId))
      .where(eq(likesInPost.userId, userId)),
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
