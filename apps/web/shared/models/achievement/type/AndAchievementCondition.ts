import type { AchievementCondition } from "#shared/models/achievement/AchievementCondition";
import type { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";
import type { ItemEntityType } from "@esposter/shared";

export interface AndAchievementCondition<TPath extends TRPCPaths> extends ItemEntityType<AchievementConditionType.And> {
  conditions: AchievementCondition<TPath>[];
}
