import type { AchievementCategory } from "@@/server/models/achievement/AchievementCategory";
import type { AchievementCondition } from "@@/server/models/achievement/AchievementCondition";
import type { TRPCPaths } from "@@/server/models/trpc/TRPCPaths";
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
