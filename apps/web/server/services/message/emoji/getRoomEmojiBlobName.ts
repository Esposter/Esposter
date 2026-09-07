import type { RoomEmojiInMessage } from "@esposter/db-schema";

// The one place a room emoji's blob name is spelled. It is derived from the id rather than stored, so the row
// Can never disagree with storage about where the image is, and the whole `{roomId}/…` prefix is already swept
// By the room's own teardown (/docs/architecture/blob-lifecycle)
export const getRoomEmojiBlobName = (roomId: RoomEmojiInMessage["roomId"], id: RoomEmojiInMessage["id"]) =>
  `${roomId}/emoji/${id}`;
