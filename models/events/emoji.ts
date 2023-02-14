import type { MessageEmojiMetadataEntity } from "@/models/azure/message/emoji";
import type { DeleteEmojiInput, UpdateEmojiInput } from "@/server/trpc/routers/emoji";
import EventEmitter from "eventemitter3";

interface EmojiEvents {
  onCreateEmoji: (data: MessageEmojiMetadataEntity) => void;
  onUpdateEmoji: (data: UpdateEmojiInput) => void;
  onDeleteEmoji: (data: DeleteEmojiInput) => void;
}

export const emojiEventEmitter = new EventEmitter<EmojiEvents>();
