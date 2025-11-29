import { AchievementConditionType } from "#shared/models/achievement/AchievementConditionType";
import { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import { dayjs } from "#shared/services/dayjs";
import { BinaryOperator } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";

export const checkAchievementCondition = (
  condition: NonNullable<(typeof achievementDefinitions)[number]["condition"]>,
  data: unknown,
): boolean => {
  switch (condition.type) {
    case AchievementConditionType.And:
      return condition.conditions.every((c) => checkAchievementCondition(c, data));
    case AchievementConditionType.Or:
      return condition.conditions.some((c) => checkAchievementCondition(c, data));
    case AchievementConditionType.Property: {
      // @ts-expect-error We can assume types are correct as achievementDefinitions is defined properly
      const value = condition.path.split(".").reduce((property, key) => property[key], data);
      switch (condition.operator) {
        case BinaryOperator.eq:
          return value === condition.value;
        case BinaryOperator.ge:
          // @ts-expect-error We can assume types are correct as achievementDefinitions is defined properly
          return value >= condition.value;
        case BinaryOperator.gt:
          // @ts-expect-error We can assume types are correct as achievementDefinitions is defined properly
          return value > condition.value;
        case BinaryOperator.le:
          // @ts-expect-error We can assume types are correct as achievementDefinitions is defined properly
          return value <= condition.value;
        case BinaryOperator.lt:
          // @ts-expect-error We can assume types are correct as achievementDefinitions is defined properly
          return value < condition.value;
        case BinaryOperator.ne:
          return value !== condition.value;
        case "contains":
          return typeof value === "string" && value.toLowerCase().includes(String(condition.value).toLowerCase());
        default:
          exhaustiveGuard(condition.operator);
      }
    }
    // oxlint-disable-next-line no-fallthrough
    case AchievementConditionType.Time: {
      const { max, min, referenceUnit, unit } = condition;
      const now = dayjs();
      const value = now.diff(now.startOf(referenceUnit), unit);
      return value >= min && value < max;
    }
  }
};
