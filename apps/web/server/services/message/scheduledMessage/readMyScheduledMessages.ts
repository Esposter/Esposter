import type { Context } from "#server/trpc/context";
import type { ReadMyScheduledMessagesInput } from "#shared/models/db/message/scheduledMessage/ReadMyScheduledMessagesInput";
import type { ScheduledMessageWithRoom } from "#shared/models/db/message/scheduledMessage/ScheduledMessageWithRoom";
import type { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

import { useUserObject } from "#server/composables/realtime/useUserObject";
import { fanOutRoomReads } from "#server/services/message/fanOutRoomReads";
import { getBasePaginationData } from "#server/services/pagination/getBasePaginationData";
import { inJsonArray } from "@esposter/db";
import { roomsInMessage } from "@esposter/db-schema";

// The sender's index names the rooms they have scheduled a message in. Each of those rooms' objects lists the messages
// the sender scheduled there, and the page is those, soonest first
export const readMyScheduledMessages = async (
  db: Context["db"],
  userId: string,
  { limit, offset }: ReadMyScheduledMessagesInput,
): Promise<BasePaginationData<ScheduledMessageWithRoom>> => {
  const indexedRoomIds = (await useUserObject(userId).readScheduledMessages()).map(({ roomId }) => roomId);
  const messagesByRoomId = await fanOutRoomReads(indexedRoomIds, (roomObject) =>
    roomObject.readScheduledMessages(userId),
  );
  const roomIds = [...messagesByRoomId.keys()];
  const rooms =
    roomIds.length > 0 ? await db.select().from(roomsInMessage).where(inJsonArray(roomsInMessage.id, roomIds)) : [];
  const roomMap = new Map(rooms.map((room) => [room.id, room]));
  const scheduledMessages = [...messagesByRoomId].flatMap(([roomId, messages]) => {
    const room = roomMap.get(roomId);
    return room ? messages.map((scheduledMessage) => ({ ...scheduledMessage, room, roomId })) : [];
  });
  const soonestFirst = scheduledMessages.toSorted(
    (firstMessage, secondMessage) => firstMessage.runAt.getTime() - secondMessage.runAt.getTime(),
  );
  return getBasePaginationData(soonestFirst.slice(offset, offset + limit + 1), limit);
};
