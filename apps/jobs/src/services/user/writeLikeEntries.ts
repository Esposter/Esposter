import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { RoomReaction, UserInAuth } from "@esposter/db-schema";

import { ArchiveLikeKind } from "#src/models/user/ArchiveLikeKind";
import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getRoomObject } from "#src/services/room/getRoomObject";
import { OBJECT_READ_PAGE_LIMIT } from "#src/services/shared/constants";
import { db } from "#src/services/shared/db";
import { readPagesToEnd } from "#src/services/shared/readPagesToEnd";

// The person's likes and dislikes of posts, and their emoji reactions in the rooms they are a member of.
// Each entry names its target and carries no counts, and no other person's reaction is listed.
// A post like carries the time it was made.
// A reaction carries none: its row is shared by its reactors, so its time is the first reactor's
export const writeLikeEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const postLikes = await db.query.likesInPost.findMany({
    columns: { createdAt: true, postId: true, value: true },
    where: { userId: { eq: userId } },
  });
  const roomIds = await getAccountMemberRoomIds(userId);
  const emojiReactions: { emojiTag: string; kind: ArchiveLikeKind; roomId: string; targetId: number }[] = [];
  for (const roomId of roomIds)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one room at a time, and one page of its reactions at a time
    await readPagesToEnd(
      (after, limit) => getRoomObject(roomId).exportUserReactions({ after, limit, userId }),
      ({ emojiTag, messageId }: RoomReaction) => ({ emojiTag, messageId }),
      OBJECT_READ_PAGE_LIMIT,
      (reactions) => {
        emojiReactions.push(
          ...reactions.map(({ emojiTag, messageId }) => ({
            emojiTag,
            kind: ArchiveLikeKind.Emoji,
            roomId,
            targetId: messageId,
          })),
        );
      },
    );
  await archive.addJsonEntry("likes.json", [
    ...postLikes.map(({ createdAt, postId, value }) => ({
      createdAt,
      kind: ArchiveLikeKind.Post,
      targetId: postId,
      value,
    })),
    ...emojiReactions,
  ]);
};
