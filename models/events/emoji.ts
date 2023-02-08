import type { AzureUpdateEntity, CompositeKey } from "@/models/azure";
import type { MessageEmojiMetadataEntity } from "@/models/azure/message/emoji";
import EventEmitter from "eventemitter3";

interface EmojiEvents {
  onCreateEmoji: (data: MessageEmojiMetadataEntity) => void;
  onUpdateEmoji: (data: AzureUpdateEntity<MessageEmojiMetadataEntity>) => void;
  onDeleteEmoji: (data: CompositeKey) => void;
}

export const emojiEventEmitter = new EventEmitter<EmojiEvents>();
