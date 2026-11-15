import type { Context } from "#server/trpc/context";
import type { ReadMySentMessagesInput } from "#shared/models/db/message/ReadMySentMessagesInput";
import type { ReadMySentMessagesResult } from "#shared/models/db/message/ReadMySentMessagesResult";
import type { RoomMessage } from "@esposter/db-schema";

import { useUserObject } from "#server/composables/realtime/useUserObject";
import { fanOutRoomReads } from "#server/services/message/fanOutRoomReads";
import { inJsonArray, toPage } from "@esposter/db";
import { roomsInMessage, SENT_MESSAGE_PAGE_SORT, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// The sender's index names each sent message by its room and id, newest first. Each room's object is asked for the
// Messages the index names there, and the page keeps the index's order: a message its room no longer holds is dropped
// From the page, and no other message takes its place. The cursor continues from the index's last entry, whether or not
// Its message survived, so the next page starts after everything this one read. A room the caller has left is dropped too,
// Since its name and the messages they sent there are no longer theirs to see
export const readMySentMessages = async (
  { cursor, limit }: ReadMySentMessagesInput,
  db: Context["db"],
  userId: string,
): Promise<ReadMySentMessagesResult> => {
  const rows = await useUserObject(userId).readSentMessages({ cursor, limit: limit + 1 });
  const page = toPage(rows, SENT_MESSAGE_PAGE_SORT, cursor, limit);
  const roomIdMessageIdsMap = new Map<string, number[]>();
  for (const { messageId, roomId } of page.items)
    roomIdMessageIdsMap.set(roomId, [...(roomIdMessageIdsMap.get(roomId) ?? []), messageId]);

  const roomIds = [...roomIdMessageIdsMap.keys()];
  const [messagesByRoomId, rooms] = await Promise.all([
    fanOutRoomReads(roomIds, async (roomObject, roomId) => {
      const messages: RoomMessage[] = await roomObject.readMessagesByIds(roomIdMessageIdsMap.get(roomId) ?? []);
      return new Map(messages.map((message) => [message.id, message]));
    }),
    roomIds.length > 0
      ? db
          .select({ room: roomsInMessage })
          .from(roomsInMessage)
          .innerJoin(
            usersToRoomsInMessage,
            and(eq(usersToRoomsInMessage.roomId, roomsInMessage.id), eq(usersToRoomsInMessage.userId, userId)),
          )
          .where(inJsonArray(roomsInMessage.id, roomIds))
      : [],
  ]);
  const roomMap = new Map(rooms.map(({ room }) => [room.id, room]));
  return {
    items: page.items.flatMap(({ messageId, roomId }) => {
      const message = messagesByRoomId.get(roomId)?.get(messageId);
      const room = roomMap.get(roomId);
      return message && room ? [{ message, room }] : [];
    }),
    nextCursor: page.nextCursor,
  };
};
