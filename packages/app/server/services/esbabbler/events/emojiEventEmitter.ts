import type { DeleteEmojiInput, UpdateEmojiInput } from "@/server/trpc/routers/message/emoji";
import type { MessageEmojiMetadataEntity } from "@/shared/models/esbabbler/message/metadata/emoji";

import EventEmitter from "eventemitter3";

interface EmojiEvents {
  createEmoji: (data: MessageEmojiMetadataEntity) => void;
  deleteEmoji: (data: DeleteEmojiInput) => void;
  updateEmoji: (data: UpdateEmojiInput) => void;
}

export const emojiEventEmitter = new EventEmitter<EmojiEvents>();
