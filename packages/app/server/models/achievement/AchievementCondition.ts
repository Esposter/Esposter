import { BinaryOperator } from "@esposter/db-schema";

export type AchievementCondition =
  | {
      conditions: AchievementCondition[];
      type: "and";
    }
  | {
      conditions: AchievementCondition[];
      type: "or";
    }
  | {
      endHour: number;
      startHour: number;
      type: "time";
    }
  | {
      operator: "contains" | BinaryOperator;
      path: string;
      type: "property";
      value: unknown;
    };
