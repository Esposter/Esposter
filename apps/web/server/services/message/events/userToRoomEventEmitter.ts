import type { UserToRoomEvents } from "#server/models/message/events/UserToRoomEvents";

import { EventEmitter } from "node:events";

export const userToRoomEventEmitter = new EventEmitter<UserToRoomEvents>();
