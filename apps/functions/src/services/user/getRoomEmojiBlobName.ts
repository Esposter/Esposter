import type { RoomEmojiInMessage, RoomInMessage } from "@esposter/db-schema";

// A room emoji's blob, named the way the room writes it, so the archive reads the blob the room holds
export const getRoomEmojiBlobName = (roomId: RoomInMessage["id"], emojiId: RoomEmojiInMessage["id"]) =>
  `${roomId}/emoji/${emojiId}`;
