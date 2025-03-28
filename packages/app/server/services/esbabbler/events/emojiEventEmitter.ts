import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";

import { EventEmitter } from "node:events";

interface EmojiEvents {
  createEmoji: MessageEmojiMetadataEntity[];
  deleteEmoji: DeleteEmojiInput[];
  updateEmoji: (Pick<MessageEmojiMetadataEntity, "updatedAt"> & UpdateEmojiInput)[];
}

export const emojiEventEmitter = new EventEmitter<EmojiEvents>();
