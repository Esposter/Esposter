import type { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import type { OpUnitType } from "dayjs";

export interface TimeAchievementCondition {
  max: number;
  min: number;
  referenceUnit: OpUnitType;
  type: AchievementConditionType.Time;
  unit: OpUnitType;
}
