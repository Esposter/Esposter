import type { RoomEvents } from "#server/models/message/events/RoomEvents";

import { EventEmitter } from "node:events";

export const roomEventEmitter = new EventEmitter<RoomEvents>();
