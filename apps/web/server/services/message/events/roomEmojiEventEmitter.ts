import type { RoomEmojiEvents } from "#server/models/message/events/RoomEmojiEvents";

import { EventEmitter } from "node:events";

export const roomEmojiEventEmitter = new EventEmitter<RoomEmojiEvents>();
