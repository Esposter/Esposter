import type { AchievementCondition } from "@@/server/models/achievement/AchievementCondition";
import type { TRPCPaths } from "@@/server/models/trpc/TRPCPaths";

import { dayjs } from "#shared/services/dayjs";
import { BinaryOperator, UnaryOperator } from "@esposter/db-schema";

export const checkAchievementCondition = <TPath extends TRPCPaths>(
  condition: AchievementCondition<TPath>,
  eventData: unknown,
): boolean => {
  switch (condition.type) {
    case "property": {
      const value = condition.path.split(".").reduce((o, i) => o?.[i], eventData);
      switch (condition.operator) {
        case BinaryOperator.eq:
          return value === condition.value;
        case BinaryOperator.ge:
          return value >= condition.value;
        case BinaryOperator.gt:
          return value > condition.value;
        case BinaryOperator.le:
          return value <= condition.value;
        case BinaryOperator.lt:
          return value < condition.value;
        case "contains":
          return typeof value === "string" && value.toLowerCase().includes(String(condition.value).toLowerCase());
        default:
          return false;
      }
    }
    case "time": {
      const { max, min, referenceUnit, unit } = condition;
      const now = dayjs();
      const value = now.diff(now.startOf(referenceUnit), unit);
      return value >= min && value < max;
    }
    case UnaryOperator.and:
      return condition.conditions.every((c) => checkAchievementCondition(c, eventData));
    case UnaryOperator.or:
      return condition.conditions.some((c) => checkAchievementCondition(c, eventData));
    default:
      return false;
  }
};
