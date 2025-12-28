import type { MessageEvents } from "#shared/models/message/events/MessageEvents";

import { EventEmitter } from "node:events";

export const messageEventEmitter = new EventEmitter<MessageEvents>();
