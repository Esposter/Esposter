import type { Device } from "#shared/models/auth/Device";
import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";

import { EventEmitter } from "node:events";

interface EmojiEvents {
  // We need to know who actually operated on the emoji
  // so we don't send duplicate events back to the original user
  createEmoji: [MessageEmojiMetadataEntity, Device][];
  deleteEmoji: [DeleteEmojiInput, Device][];
  updateEmoji: [Pick<MessageEmojiMetadataEntity, "userIds"> & UpdateEmojiInput, Device][];
}

export const emojiEventEmitter = new EventEmitter<EmojiEvents>();
