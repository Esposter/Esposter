import type { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";
import type { AchievementCondition } from "@@/server/models/achievement/AchievementCondition";
import type { AchievementName } from "@esposter/db-schema";

export interface AchievementDefinition<TPath extends TRPCPaths> {
  amount?: number;
  category: AchievementCategory;
  condition?: AchievementCondition<TPath>;
  description: string;
  icon: string;
  incrementAmount?: number;
  isHidden?: true;
  name: AchievementName;
  points: number;
  triggerPath: TPath;
}
