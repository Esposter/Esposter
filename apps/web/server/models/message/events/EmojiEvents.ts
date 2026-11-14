import type { Device } from "#shared/models/auth/Device";
import type { DeleteEmojiInput, MessageEmojiMetadataEntity, UpdateEmojiInput } from "@esposter/db-schema";

export interface EmojiEvents {
  createEmoji: [[MessageEmojiMetadataEntity, Device]];
  deleteEmoji: [[DeleteEmojiInput, Device]];
  updateEmoji: [[Pick<MessageEmojiMetadataEntity, "messageRowKey" | "userIds"> & UpdateEmojiInput, Device]];
}
