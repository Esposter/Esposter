import { AchievementConditionType } from "#shared/models/achievement/AchievementConditionType";
import { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import { dayjs } from "#shared/services/dayjs";
import { EN_US_SEGMENTER } from "@/services/shared/constants";
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
        case AchievementOperator.Contains:
          return typeof value === "string" && value.toLowerCase().includes(condition.value.toLowerCase());
        case AchievementOperator.IsPalindrome: {
          if (typeof value !== "string") return false;
          const sanitizedValue = value.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
          return sanitizedValue === [...EN_US_SEGMENTER.segment(sanitizedValue)].toReversed().join("");
        }
        case AchievementOperator.Matches:
          if (!(condition.value instanceof RegExp)) return false;
          return typeof value === "string" && condition.value.test(value);
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
        default:
          exhaustiveGuard(condition);
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
