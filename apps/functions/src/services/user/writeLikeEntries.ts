import type { UserDataArchive } from "#src/models/user/UserDataArchive";
import type { UserInAuth } from "@esposter/db-schema";

import { ArchiveLikeKind } from "#src/models/user/ArchiveLikeKind";
import { getAccountMemberRoomIds } from "#src/services/account/getAccountMemberRoomIds";
import { getTableClient } from "#src/services/azure/getTableClient";
import { db } from "#src/services/shared/db";
import { readRoomEmojiReactionsByUser } from "#src/services/user/readRoomEmojiReactionsByUser";
import { AzureTable } from "@esposter/db-schema";

// The person's likes and dislikes of posts, and their emoji reactions in the rooms they are a member of.
// Each entry names its target and carries no counts, and no other person's reaction is listed.
// A post like carries the time it was made.
// A reaction carries none: its row is shared by its reactors, so its time is the first reactor's
export const writeLikeEntries = async (archive: UserDataArchive, userId: UserInAuth["id"]): Promise<void> => {
  const postLikes = await db.query.likesInPost.findMany({
    columns: { createdAt: true, postId: true, value: true },
    where: { userId: { eq: userId } },
  });
  const messagesMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
  const roomIds = await getAccountMemberRoomIds(userId);
  const emojiReactions = [];
  for (const roomId of roomIds)
    // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one room at a time, as the room entries are read
    emojiReactions.push(...(await readRoomEmojiReactionsByUser(messagesMetadataClient, roomId, userId)));
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
