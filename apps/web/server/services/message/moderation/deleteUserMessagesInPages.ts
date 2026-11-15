import type { RoomMessage } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { DELETE_USER_MESSAGES_PAGE_LIMIT } from "#server/services/message/constants";

// Every live message a person wrote in a room is tombstoned, a page at a time. A page that comes back full may be followed
// By another, so the next page continues after the last message the room answered
export const deleteUserMessagesInPages = async (
  roomId: string,
  userId: string,
  after?: number,
): Promise<RoomMessage[]> => {
  const messages = await useRoomObject(roomId).deleteUserMessages({
    after,
    limit: DELETE_USER_MESSAGES_PAGE_LIMIT,
    userId,
  });
  if (messages.length < DELETE_USER_MESSAGES_PAGE_LIMIT) return messages;

  return [...messages, ...(await deleteUserMessagesInPages(roomId, userId, messages.at(-1)?.id))];
};
