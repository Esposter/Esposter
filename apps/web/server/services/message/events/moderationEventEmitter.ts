import type { ModerationEvents } from "#server/models/message/events/ModerationEvents";

import { EventEmitter } from "node:events";

export const moderationEventEmitter = new EventEmitter<ModerationEvents>();
