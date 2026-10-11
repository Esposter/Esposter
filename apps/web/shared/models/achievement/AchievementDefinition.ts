import type { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";
import type { TRPCRouterInputs } from "#shared/models/trpc/TRPCRouterInputs";
import type { AchievementName } from "@esposter/db-schema";
import type { Get } from "type-fest";
import type { z } from "zod";

export interface AchievementDefinition<TPath extends TRPCPaths> {
  amount?: number;
  category: AchievementCategory;
  description: string;
  icon: string;
  incrementAmount?: number;
  // The trigger procedure's input schema, which parses the raw input before a condition reads it
  inputSchema: z.ZodType<Get<TRPCRouterInputs, TPath>>;
  isHidden?: true;
  name: AchievementName;
  points: number;
  triggerPath: TPath;
}
