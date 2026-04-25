import type { AchievementCondition } from "#shared/models/achievement/AchievementCondition";
import type { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";

export interface OrAchievementCondition<TPath extends TRPCPaths> {
  conditions: AchievementCondition<TPath>[];
  type: AchievementConditionType.Or;
}
