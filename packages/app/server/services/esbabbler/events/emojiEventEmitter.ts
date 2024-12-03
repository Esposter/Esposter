import type { DeleteEmojiInput } from "#shared/models/esbabbler/message/metadata/DeleteEmojiInput";
import type { MessageEmojiMetadataEntity } from "#shared/models/esbabbler/message/metadata/emoji";
import type { UpdateEmojiInput } from "#shared/models/esbabbler/message/metadata/UpdateEmojiInput";

import EventEmitter from "eventemitter3";

interface EmojiEvents {
  createEmoji: (data: MessageEmojiMetadataEntity) => void;
  deleteEmoji: (data: DeleteEmojiInput) => void;
  updateEmoji: (data: UpdateEmojiInput) => void;
}

export const emojiEventEmitter = new EventEmitter<EmojiEvents>();
