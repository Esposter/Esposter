import type { RecursiveGetProperties } from "#shared/util/types/RecursiveGetProperties";
import type { AchievementConditionType } from "@@/server/models/achievement/AchievementConditionType";
import type { TRPCPaths } from "@@/server/models/trpc/TRPCPaths";
import type { TRPCRouterInputs } from "@@/server/models/trpc/TRPCRouterInputs";
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
