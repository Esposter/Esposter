import type { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import type { ItemEntityType } from "@esposter/shared";
import type { OpUnitType } from "dayjs";

export interface TimeAchievementCondition extends ItemEntityType<AchievementConditionType.Time> {
  maximum: number;
  minimum: number;
  referenceUnit: OpUnitType;
  unit: OpUnitType;
}
