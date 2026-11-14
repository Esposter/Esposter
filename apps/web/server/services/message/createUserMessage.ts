import type { Context } from "#server/trpc/context";
import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";
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
  MessageType,
  publishNotification,
  QueueJob,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

type RoomObject = ReturnType<typeof useRoomObject>;

// The root's author, which a reply's thread follow owes the root's author a follow for. A message that is not a reply
// has no root to read
const readThreadRootUserId = async (roomObject: RoomObject, replyToId: number | null) => {
  if (replyToId === null) return undefined;

  const [threadRoot] = await roomObject.readMessagesByIds([replyToId]);
  return threadRoot?.userId ?? undefined;
};

export const createUserMessage = async (
  db: Context["db"],
  actor: RoomActor,
  input: CreateMessageInput,
): Promise<RoomMessage> => {
  const { files, replyToId, roomId, type } = input;
  const message = input.message || "";
  const now = new Date();
  // The gate reads the slowmode clock and the send advances it, so the member's row is held across both: two sends
  // Racing one window then run one after the other, and the second reads the first's stamp rather than both passing
  const rejection = await db.transaction(async (tx) => {
    await tx
      .select({ userId: usersToRoomsInMessage.userId })
      .from(usersToRoomsInMessage)
      .where(getRoomMembershipWhere(roomId, actor.userId))
      .for("update");
    const messageCreationRejection = await getMessageCreationRejection(tx, actor.userId, roomId, input.message);
    if (!messageCreationRejection)
      await updateUserToRoom(tx, actor.userId, { lastMessageAt: now, lastReadAt: now, roomId });
    return messageCreationRejection;
  });
  await rejectMessageCreation(db, actor.userId, roomId, rejection);

  // The room's object writes the message, indexes it for the sender and broadcasts it to the room's viewers. The room's
  // updatedAt is not written here: the object's own alarm moves the room to the top of its members' lists
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
  // before the publish below, for the reason `createReplyThreadFollows` states
  await getResultAsync(async () => {
    const threadRootUserId = await readThreadRootUserId(roomObject, newMessage.replyToId);
    await createReplyThreadFollows(db, { message: newMessage, roomId, threadRootUserId });
  }).match(noop, console.error);
  // One notification for the send, thread reply or not: the room's own recipients and the thread's followers are one
  // recipient set resolved by ProcessNotification, so a follower is never notified twice and this path runs no
  // recipient query of its own. Best-effort after the write — a failed publish loses one notification, never the message
  await getResultAsync(() =>
    publishNotification(getJobQueue(QueueJob.ProcessNotification), {
      message: { id: newMessage.id, message: newMessage.message, roomId, userId: newMessage.userId },
      threadRootId: newMessage.replyToId,
      type: AppNotificationType.Message,
    }),
  ).match(noop, console.error);
  return newMessage;
};
