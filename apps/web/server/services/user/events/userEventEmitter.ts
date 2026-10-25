import type { UserEvents } from "#server/models/user/events/UserEvents";

import { EventEmitter } from "node:events";

export const userEventEmitter = new EventEmitter<UserEvents>();
