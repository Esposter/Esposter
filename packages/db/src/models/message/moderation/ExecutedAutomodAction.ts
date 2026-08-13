import type { AdminActionType } from "@esposter/db-schema";

export interface ExecutedAutomodAction {
  durationMs?: number;
  type: AdminActionType;
}
