import type { TableMapper } from "#src/models/cutover/TableMapper";

import { messageEmojiTableMapper } from "#src/services/cutover/tables/messageEmojiTableMapper";
import { messageTableMapper } from "#src/services/cutover/tables/messageTableMapper";

// In copy order: an emoji attaches to a message, so every message is copied before its emojis. The other six former Azure Tables
// join this list as their typed tables land
export const tableMappers: TableMapper[] = [messageTableMapper, messageEmojiTableMapper];
