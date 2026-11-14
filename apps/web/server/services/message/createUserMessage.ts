import type { Context } from "#server/trpc/context";
import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";
import type { MessageCreationRejection } from "@esposter/db";
import type { RoomActor, RoomMessage } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { rejectMessageCreation } from "#server/services/message/moderation/rejectMessageCreation";
import { updateUserToRoom } from "#server/services/message/updateUserToRoom";
import { getJobQueue } from "#server/services/queue/getJobQueue";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import {
  createReplyThreadFollows,
  getLinkPreviewResponse,
  getMentionIds,
  getMessageCreationRejection,
  incrementMentionCounts,
} from "@esposter/db";
import {
  AppNotificationType,
  MessageCreationRejectionType,
  MessageType,
  publishNotification,
  QueueJob,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq, isNull } from "drizzle-orm";

type RoomObject = ReturnType<typeof useRoomObject>;

// The root's author, which a reply's thread follow owes the root's author a follow for. A message that is not a reply
// Has no root to read
const readThreadRootUserId = async (roomObject: RoomObject, replyToId: null | number) => {
  if (replyToId === null) return undefined;

  const [threadRoot] = await roomObject.readMessagesByIds([replyToId]);
  return threadRoot?.userId ?? undefined;
};

// Two tries: a claim lost to a send of the same member's racing this one decides again on the clock that won, and a
// Second loss is the member racing themselves, which is what slowmode refuses
const claimSendSlot = async (
  db: Context["db"],
  userId: string,
  roomId: string,
  message: string | undefined,
  now: Date,
  isRetry = false,
): Promise<MessageCreationRejection | undefined> => {
  const member = await db.query.usersToRoomsInMessage.findFirst({
    columns: { lastMessageAt: true },
    where: { roomId: { eq: roomId }, userId: { eq: userId } },
  });
  const rejection = await getMessageCreationRejection(db, userId, roomId, message);
  if (rejection) return rejection;

  const claimed = await db
    .update(usersToRoomsInMessage)
    .set({ lastMessageAt: now, lastReadAt: now })
    .where(
      and(
        getRoomMembershipWhere(roomId, userId),
        member?.lastMessageAt
          ? eq(usersToRoomsInMessage.lastMessageAt, member.lastMessageAt)
          : isNull(usersToRoomsInMessage.lastMessageAt),
      ),
    )
    .returning({ userId: usersToRoomsInMessage.userId });
  if (claimed.length > 0) return undefined;
  return isRetry
    ? { type: MessageCreationRejectionType.Slowmode }
    : claimSendSlot(db, userId, roomId, message, now, true);
};

export const createUserMessage = async (
  db: Context["db"],
  actor: RoomActor,
  input: CreateMessageInput,
): Promise<RoomMessage> => {
  const { files, replyToId, roomId, type } = input;
  const message = input.message || "";
  const now = new Date();
  // The gate decides and the send claims the slowmode clock, as one guarded write: D1 has no interactive transaction, so
  // The claim is an UPDATE that lands only if the clock still reads what the decision was made against
  const rejection = await claimSendSlot(db, actor.userId, roomId, input.message, now);
  await rejectMessageCreation(db, actor.userId, roomId, rejection);
  if (!rejection) await updateUserToRoom(db, actor.userId, { lastMessageAt: now, lastReadAt: now, roomId });

  // The room's object writes the message, indexes it for the sender and broadcasts it to the room's viewers. The room's
  // `updatedAt` is not written here: the object's own alarm moves the room to the top of its members' lists
  const roomObject = useRoomObject(roomId);
  // Only a text message is unfurled and notified by its mentions: a poll's text is its own JSON, not a message to read
  const isTextMessage = type === MessageType.Message && message !== "";
  const newMessage = await roomObject.createMessage(
    {
      files,
      linkPreviewResponse: isTextMessage ? await getLinkPreviewResponse(message) : null,
      mentions: isTextMessage ? getMentionIds(message) : [],
      message,
      replyToId: replyToId ?? undefined,
      type,
    },
    actor,
  );

  // Best-effort after the write — a failed increment loses one badge count, never a message
  const mentionedUsersToRooms = await getResultAsync(() =>
    incrementMentionCounts(db, { message, roomId, userId: actor.userId }),
  )
    .orTee(console.error)
    .unwrapOr([]);
  await Promise.all(
    mentionedUsersToRooms.map((mentionedUserToRoom) =>
      callUserObjects([mentionedUserToRoom.userId], (userObject) => userObject.updateUserToRoom(mentionedUserToRoom)),
    ),
  );
  // Post-persist and best-effort — a follow failure must never fail the reply that already landed — but strictly
  // Before the publish below, for the reason `createReplyThreadFollows` states
  await getResultAsync(async () => {
    const threadRootUserId = await readThreadRootUserId(roomObject, newMessage.replyToId);
    await createReplyThreadFollows(db, { message: newMessage, roomId, threadRootUserId });
  }).match(noop, console.error);
  // One notification for the send, thread reply or not: the room's own recipients and the thread's followers are one
  // Recipient set resolved by ProcessNotification, so a follower is never notified twice and this path runs no
  // Recipient query of its own. Best-effort after the write — a failed publish loses one notification, never the message
  await getResultAsync(() =>
    publishNotification(getJobQueue(QueueJob.ProcessNotification), {
      message: { id: newMessage.id, message: newMessage.message, roomId, userId: newMessage.userId },
      threadRootId: newMessage.replyToId,
      type: AppNotificationType.Message,
    }),
  ).match(noop, console.error);
  return newMessage;
};
