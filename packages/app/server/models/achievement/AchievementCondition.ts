import { BinaryOperator, UnaryOperator } from "@esposter/db-schema";

export type AchievementCondition =
  | {
      conditions: AchievementCondition[];
      type: UnaryOperator.and;
    }
  | {
      conditions: AchievementCondition[];
      type: UnaryOperator.or;
    }
  | {
      endTime: string;
      startTime: string;
      type: "time";
    }
  | {
      operator: "contains" | BinaryOperator;
      path: string;
      type: "property";
      value: unknown;
    };
