import type { EmojiEvents } from "#server/models/message/events/EmojiEvents";

import { EventEmitter } from "node:events";

export const emojiEventEmitter = new EventEmitter<EmojiEvents>();
