import type { BasePaginationData } from "#shared/models/pagination/BasePaginationData";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { ClientMessage } from "@/models/message/ClientMessage";
import type { RoomMessage } from "@esposter/db-schema";

// A page of a room's messages as the client holds it. The room adds each message's roomId, since a row names only
// Its own id, and the next cursor is the id of the page's oldest message, which the next page reads before
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
