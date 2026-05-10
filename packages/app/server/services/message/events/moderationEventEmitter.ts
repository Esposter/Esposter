import type { AdminActionType } from "@esposter/db-schema";

import { EventEmitter } from "node:events";

interface ModerationEvents {
  adminAction: [{ durationMs?: number; roomId: string; targetUserId: string; type: AdminActionType }];
}

export const moderationEventEmitter = new EventEmitter<ModerationEvents>();
