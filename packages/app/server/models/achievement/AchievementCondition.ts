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
