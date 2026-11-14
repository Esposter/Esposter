import type { ClientMessage } from "@/models/message/ClientMessage";
import type { RoomMessage } from "@esposter/db-schema";

import { BasePaginationData } from "#shared/models/pagination/BasePaginationData";
import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";

// A page of a room's messages as the client holds it. The room adds each message's roomId, since a row names only its own
// id, and the next cursor is the id of the page's oldest message, which the next page reads before
export const toMessagePage = (
  roomId: ClientMessage["roomId"],
  { hasMore, items }: BasePaginationData<RoomMessage>,
): CursorPaginationData<ClientMessage> => {
  const oldestMessage = items.at(-1);
  return {
    hasMore,
    items: items.map((message) => ({ ...message, roomId })),
    nextCursor: hasMore && oldestMessage ? String(oldestMessage.id) : "",
  };
};
