import type { OpUnitType } from "dayjs";

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
      max: number;
      min: number;
      referenceUnit: OpUnitType;
      type: "time";
      unit: OpUnitType;
    }
  | {
      operator: "contains" | BinaryOperator;
      path: string;
      type: "property";
      value: unknown;
    };
