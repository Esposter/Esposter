import type { Database, Topic } from "@esposter/db-schema";

import {
  bansInMessage,
  blocksInSocial,
  friendRequestsInSocial,
  getTopic,
  invitesInMessage,
  moderationLogsInMessage,
  moderationNotesInMessage,
  postsInPost,
  TopicKind,
} from "@esposter/db-schema";
import { eq, or } from "drizzle-orm";

// The topics of the reads that show a person's name or image beyond their own profile, listed from the rows that name
// Them rather than from their memberships: a ban, an invite, a log entry or a note outlives the membership it was made in,
// And a read of it still shows the person. A profile save publishes these, and so does an erasure, before its rows go
export const getPersonReaderTopics = async (db: Database, userId: string): Promise<Topic[]> => {
  const [friendRequests, blocks, posts, invites, bans, logs, notes] = await Promise.all([
    db
      .select({ receiverId: friendRequestsInSocial.receiverId, senderId: friendRequestsInSocial.senderId })
      .from(friendRequestsInSocial)
      .where(or(eq(friendRequestsInSocial.senderId, userId), eq(friendRequestsInSocial.receiverId, userId))),
    db.select({ blockerId: blocksInSocial.blockerId }).from(blocksInSocial).where(eq(blocksInSocial.blockedId, userId)),
    db
      .select({ ancestorIds: postsInPost.ancestorIds, id: postsInPost.id })
      .from(postsInPost)
      .where(eq(postsInPost.userId, userId)),
    db.select({ roomId: invitesInMessage.roomId }).from(invitesInMessage).where(eq(invitesInMessage.userId, userId)),
    db
      .select({ roomId: bansInMessage.roomId })
      .from(bansInMessage)
      .where(or(eq(bansInMessage.userId, userId), eq(bansInMessage.bannedByUserId, userId))),
    db
      .select({ roomId: moderationLogsInMessage.roomId })
      .from(moderationLogsInMessage)
      .where(or(eq(moderationLogsInMessage.actorUserId, userId), eq(moderationLogsInMessage.targetUserId, userId))),
    db
      .select({ roomId: moderationNotesInMessage.roomId })
      .from(moderationNotesInMessage)
      .where(eq(moderationNotesInMessage.actorUserId, userId)),
  ]);

  return [
    // A request's sender and receiver are each the other's counterpart on the other's list
    ...friendRequests.map(({ receiverId, senderId }) =>
      getTopic(TopicKind.FriendRequest, senderId === userId ? receiverId : senderId),
    ),
    ...blocks.map(({ blockerId }) => getTopic(TopicKind.Block, blockerId)),
    // A post's page watches its thread's root, and a comment's own page watches the comment
    ...posts.flatMap(({ ancestorIds, id }) => [
      getTopic(TopicKind.Post, ancestorIds[0] ?? id),
      getTopic(TopicKind.Post, id),
    ]),
    ...[...invites, ...bans, ...logs, ...notes].map(({ roomId }) => getTopic(TopicKind.Room, roomId)),
  ];
};
