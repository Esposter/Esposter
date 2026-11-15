import type { Context } from "#server/trpc/context";
import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";
import type { RoomActor, RoomMessage } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { rejectMessageCreation } from "#server/services/message/moderation/rejectMessageCreation";
import { updateUserToRoom } from "#server/services/message/updateUserToRoom";
import { getJobQueue } from "#server/services/queue/getJobQueue";
import { claimMessageSendSlot, createReplyThreadFollows, getLinkPreviewResponse } from "@esposter/db";
import { AppNotificationType, MessageType, publishNotification, QueueJob } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

type RoomObject = ReturnType<typeof useRoomObject>;

// The root's author, which a reply's thread follow owes the root's author a follow for. A message that is not a reply
// Has no root to read
const readThreadRootUserId = async (roomObject: RoomObject, replyToId: null | number) => {
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
  await rejectMessageCreation(
    db,
    actor.userId,
    roomId,
    await claimMessageSendSlot(db, actor.userId, roomId, input.message, new Date()),
  );

  // The room's object writes the message, indexes it for the sender and broadcasts it to the room's viewers. The room's
  // `updatedAt` is not written here: the object's own alarm moves the room to the top of its members' lists
  const roomObject = useRoomObject(roomId);
  // Only a text message is unfurled and notified by its mentions: a poll's text is its own JSON, not a message to read
  const isTextMessage = type === MessageType.Message && message !== "";
  // The room object counts the mentions its text makes, and tells each mentioned member's object of its count
  const newMessage = await roomObject.createMessage(
    {
      files,
      linkPreviewResponse: isTextMessage ? await getLinkPreviewResponse(message) : null,
      message,
      replyToId: replyToId ?? undefined,
      type,
    },
    actor,
  );

  // The sender has read the room through their own message. The read clock is the message's time as the room's object
  // Stamped it, since the room's activity reads the same clock, and a web Worker's earlier time would leave the room unread.
  // Best-effort after the write: the message has landed, so a failed read clock costs an unread badge, never the send
  await getResultAsync(() => updateUserToRoom(db, actor.userId, { lastReadAt: newMessage.createdAt, roomId })).match(
    noop,
    console.error,
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
