import type { Context } from "#server/trpc/context";
import type { ReadMySentMessagesInput } from "#shared/models/db/message/ReadMySentMessagesInput";
import type { ReadMySentMessagesResult } from "#shared/models/db/message/ReadMySentMessagesResult";
import type { RoomMessage } from "@esposter/db-schema";

import { useUserObject } from "#server/composables/realtime/useUserObject";
import { fanOutRoomReads } from "#server/services/message/fanOutRoomReads";
import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { inJsonArray } from "@esposter/db";
import { roomsInMessage } from "@esposter/db-schema";

// The sender's index names each sent message by its room and id, newest first. Each room's object is asked for the
// Messages the index names there, and the page keeps the index's order: a message its room no longer holds is dropped
// From the page, and no other message takes its place
export const readMySentMessages = async (
  { before, limit }: ReadMySentMessagesInput,
  db: Context["db"],
  userId: string,
): Promise<ReadMySentMessagesResult> => {
  const page = getBasePaginationData(await useUserObject(userId).readSentMessages({ before, limit: limit + 1 }), limit);
  const roomIdMessageIdsMap = new Map<string, number[]>();
  for (const { messageId, roomId } of page.items)
    roomIdMessageIdsMap.set(roomId, [...(roomIdMessageIdsMap.get(roomId) ?? []), messageId]);

  const roomIds = [...roomIdMessageIdsMap.keys()];
  const messagesByRoomId = await fanOutRoomReads(roomIds, async (roomObject, roomId) => {
    const messages: RoomMessage[] = await roomObject.readMessagesByIds(roomIdMessageIdsMap.get(roomId) ?? []);
    return new Map(messages.map((message) => [message.id, message]));
  });
  const rooms =
    roomIds.length > 0 ? await db.select().from(roomsInMessage).where(inJsonArray(roomsInMessage.id, roomIds)) : [];
  const roomMap = new Map(rooms.map((room) => [room.id, room]));
  return {
    hasMore: page.hasMore,
    items: page.items.flatMap(({ messageId, roomId }) => {
      const message = messagesByRoomId.get(roomId)?.get(messageId);
      const room = roomMap.get(roomId);
      return message && room ? [{ message, room }] : [];
    }),
  };
};
