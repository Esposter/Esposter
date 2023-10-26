import type { MessageEmojiMetadataEntity } from "@/models/esbabbler/message/emoji";
import type { DeleteEmojiInput, UpdateEmojiInput } from "@/server/trpc/routers/emoji";
import EventEmitter from "eventemitter3";

interface EmojiEvents {
  createEmoji: (data: MessageEmojiMetadataEntity) => void;
  updateEmoji: (data: UpdateEmojiInput) => void;
  deleteEmoji: (data: DeleteEmojiInput) => void;
}

export const emojiEventEmitter = new EventEmitter<EmojiEvents>();
