import type { TRPCPaths } from "@@/server/models/trpc/TRPCPaths";
import type { TRPCRouterInputs } from "@@/server/models/trpc/TRPCRouterInputs";
import type { OpUnitType } from "dayjs";
import type { Get, Paths } from "type-fest";

import { BinaryOperator, UnaryOperator } from "@esposter/db-schema";

export type AchievementCondition<TPath extends TRPCPaths> =
  | (Paths<Get<TRPCRouterInputs, TPath>> extends infer PropertyPath
      ? PropertyPath extends string
        ? {
            operator: "contains" | BinaryOperator;
            path: PropertyPath;
            type: "property";
            value: Get<TRPCRouterInputs, `${TPath}.${PropertyPath}`>;
          }
        : never
      : never)
  | {
      conditions: AchievementCondition<TPath>[];
      type: UnaryOperator.and;
    }
  | {
      conditions: AchievementCondition<TPath>[];
      type: UnaryOperator.or;
    }
  | {
      max: number;
      min: number;
      referenceUnit: OpUnitType;
      type: "time";
      unit: OpUnitType;
    };
