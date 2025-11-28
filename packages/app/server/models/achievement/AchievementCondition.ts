import type { RecursiveGetProperties } from "#shared/util/types/RecursiveGetProperties";
import type { TRPCPaths } from "@@/server/models/trpc/TRPCPaths";
import type { TRPCRouterInputs } from "@@/server/models/trpc/TRPCRouterInputs";
import type { OpUnitType } from "dayjs";
import type { Get } from "type-fest";

import { BinaryOperator, UnaryOperator } from "@esposter/db-schema";

export type AchievementCondition<TPath extends TRPCPaths> =
  | (RecursiveGetProperties<Get<TRPCRouterInputs, TPath>> & {
      operator: "contains" | BinaryOperator;
      type: "property";
    })
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
