import type { AchievementCategory } from "@@/server/models/achievement/AchievementCategory";
import type { AchievementCondition } from "@@/server/models/achievement/AchievementCondition";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { AchievementName } from "@esposter/db-schema";

export interface AchievementDefinition {
  amount?: number;
  category: AchievementCategory;
  conditions?: AchievementCondition;
  description: string;
  icon: string;
  incrementAmount?: number;
  isHidden?: true;
  name: AchievementName;
  points: number;
  triggerPath: TRPCRouter;
}
