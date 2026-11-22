import type { RoomInMessage } from "@esposter/db-schema";

// Newest first, by when each room last had a message
export const compareLastMessageAtDescending = (firstRoom: RoomInMessage, secondRoom: RoomInMessage) =>
  secondRoom.lastMessageAt.getTime() - firstRoom.lastMessageAt.getTime();
