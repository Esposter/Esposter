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
      endDate: Date;
      startDate: Date;
      type: "date";
    }
  | {
      operator: "contains" | BinaryOperator;
      path: string;
      type: "property";
      value: unknown;
    };
