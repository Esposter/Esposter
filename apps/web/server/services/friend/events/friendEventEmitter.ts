import type { FriendEvents } from "#server/models/friend/events/FriendEvents";

import { EventEmitter } from "node:events";

export const friendEventEmitter = new EventEmitter<FriendEvents>();
