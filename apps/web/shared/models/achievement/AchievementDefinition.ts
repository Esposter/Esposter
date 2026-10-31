import type { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import type { ClaimedAchievementTriggerPath } from "#shared/models/achievement/ClaimedAchievementTriggerPath";
import type { TRPCPath, TRPCProcedureInputs } from "#shared/models/trpc/TRPCProcedureInputs";
import type { AchievementName } from "@esposter/db-schema";
import type { z } from "zod";

export interface AchievementDefinition<TPath extends TRPCPath> {
  amount?: number;
  category: AchievementCategory;
  description: string;
  icon: string;
  incrementAmount?: number;
  // The trigger procedure's input schema, which parses the raw input before a condition reads it
  inputSchema: z.ZodType<TRPCProcedureInputs[TPath]>;
  isHidden?: true;
  name: AchievementName;
  // What the leaderboard ranks, so only a trigger the server can vouch for may carry any
  points: TPath extends ClaimedAchievementTriggerPath ? 0 : number;
  triggerPath: TPath;
}
