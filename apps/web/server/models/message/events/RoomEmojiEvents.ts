import type { Device } from "#shared/models/auth/Device";
import type { RoomEmojiWithSasUrl } from "#shared/models/message/emoji/RoomEmojiWithSasUrl";
import type { RoomEmojiInMessage } from "@esposter/db-schema";

export interface RoomEmojiEvents {
  createRoomEmoji: [[RoomEmojiWithSasUrl, Device]];
  deleteRoomEmoji: [[Pick<RoomEmojiInMessage, "id" | "roomId">, Device]];
  updateRoomEmoji: [[RoomEmojiInMessage, Device]];
}
