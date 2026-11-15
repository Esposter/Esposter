import type { ClientMessage } from "@/models/message/ClientMessage";
import type { CursorPaginationSlice } from "@/models/pagination/cursor/CursorPaginationSlice";

// The message a dialog's write is about, and its room's items read as the write is issued
// The optimistic apply runs when the write is sent, by which time the room on screen can be another one
export const getMessageWriteTarget = (
  message: ClientMessage | undefined,
  getSlice: (roomId: string) => CursorPaginationSlice<ClientMessage>,
) => {
  if (!message) return undefined;
  const { id: messageId, roomId } = message;
  return { messageId, roomId, roomItems: getSlice(roomId).items };
};
