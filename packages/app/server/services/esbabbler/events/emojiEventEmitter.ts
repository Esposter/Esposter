import type { MessageEmojiMetadataEntity } from "#shared/models/esbabbler/message/metadata/emoji";
import type { DeleteEmojiInput, UpdateEmojiInput } from "@@/server/trpc/routers/message/emoji";

import EventEmitter from "node:events";

interface EmojiEvents {
  createEmoji: [MessageEmojiMetadataEntity];
  deleteEmoji: [DeleteEmojiInput];
  updateEmoji: [UpdateEmojiInput];
}

export const emojiEventEmitter = new EventEmitter<EmojiEvents>();
