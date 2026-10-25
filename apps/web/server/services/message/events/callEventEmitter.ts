import type { CallEvents } from "#server/models/message/events/CallEvents";

import { EventEmitter } from "node:events";

export const callEventEmitter = new EventEmitter<CallEvents>();
