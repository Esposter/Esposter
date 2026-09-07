import type { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import type { ItemEntityType } from "@esposter/shared";

export interface TimeAchievementCondition extends ItemEntityType<AchievementConditionType.Time> {
  maximum: number;
  minimum: number;
  referenceUnit: "day" | Temporal.TimeUnit;
  unit: Temporal.DateUnit | Temporal.TimeUnit;
}
