import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";
import type { User } from "better-auth";

import { EventEmitter } from "node:events";

interface EmojiEvents {
  // We need to know who actually operated on the emoji
  // so we don't send duplicate events back to the original user
  createEmoji: [MessageEmojiMetadataEntity, User["id"]][];
  deleteEmoji: [DeleteEmojiInput, User["id"]][];
  updateEmoji: [UpdateEmojiInput, User["id"]][];
}

export const emojiEventEmitter = new EventEmitter<EmojiEvents>();
