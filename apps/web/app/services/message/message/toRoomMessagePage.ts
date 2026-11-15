import type { ClientMessage } from "@/models/message/ClientMessage";
import type { Page, RoomMessage } from "@esposter/db-schema";

// A page of a room's messages as the client holds it. A row names only its own id, so the room rides on each message
export const toRoomMessagePage = (page: Page<RoomMessage>, roomId: ClientMessage["roomId"]) => ({
  items: page.items.map((message) => ({ ...message, roomId })),
  nextCursor: page.nextCursor,
});
