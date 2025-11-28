import type { AchievementConditionType } from "#shared/models/achievement/AchievementConditionType";
import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";
import type { TRPCRouterInputs } from "#shared/models/trpc/TRPCRouterInputs";
import type { RecursiveGetProperties } from "#shared/util/types/RecursiveGetProperties";
import type { BinaryOperator } from "@esposter/db-schema";
import type { OpUnitType } from "dayjs";
import type { Except, Get } from "type-fest";

export type AchievementCondition<TPath extends TRPCPaths> =
  | (Except<RecursiveGetProperties<Get<TRPCRouterInputs, TPath>>, "type"> & {
      operator: "contains" | BinaryOperator;
      type: AchievementConditionType.Property;
    })
  | {
      conditions: AchievementCondition<TPath>[];
      type: AchievementConditionType.And;
    }
  | {
      conditions: AchievementCondition<TPath>[];
      type: AchievementConditionType.Or;
    }
  | {
      max: number;
      min: number;
      referenceUnit: OpUnitType;
      type: AchievementConditionType.Time;
      unit: OpUnitType;
    };
