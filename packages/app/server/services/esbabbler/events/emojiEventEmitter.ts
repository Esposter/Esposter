import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";
import type { DeviceId } from "@@/server/models/auth/DeviceId";

import { EventEmitter } from "node:events";

interface EmojiEvents {
  // We need to know who actually operated on the emoji
  // so we don't send duplicate events back to the original user
  createEmoji: [MessageEmojiMetadataEntity, DeviceId][];
  deleteEmoji: [DeleteEmojiInput, DeviceId][];
  updateEmoji: [UpdateEmojiInput, DeviceId][];
}

export const emojiEventEmitter = new EventEmitter<EmojiEvents>();
