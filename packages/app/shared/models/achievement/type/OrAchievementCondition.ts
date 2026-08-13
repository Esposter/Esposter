import type { AchievementCondition } from "#shared/models/achievement/AchievementCondition";
import type { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";
import type { ItemEntityType } from "@esposter/shared";

export interface OrAchievementCondition<TPath extends TRPCPaths> extends ItemEntityType<AchievementConditionType.Or> {
  conditions: AchievementCondition<TPath>[];
}
