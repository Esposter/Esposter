import type { AdminActionType } from "@esposter/db-schema";

export interface ModerationEvents {
  adminAction: [{ durationMs?: number; roomId: string; targetUserId: string; type: AdminActionType }];
}
