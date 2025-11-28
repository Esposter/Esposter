import type { GetProperties } from "#shared/util/types/GetProperties";
import type { TRPCPaths } from "@@/server/models/trpc/TRPCPaths";
import type { TRPCRouterInputs } from "@@/server/models/trpc/TRPCRouterInputs";
import type { OpUnitType } from "dayjs";
import type { Get, Paths } from "type-fest";

import { BinaryOperator, UnaryOperator } from "@esposter/db-schema";

export type AchievementCondition<TPath extends TRPCPaths> =
  | ((Paths<Get<TRPCRouterInputs, TPath>> extends infer PropertyPath
      ? PropertyPath extends string
        ? Get<TRPCRouterInputs, `${TPath}.${PropertyPath}`> extends infer PropertyValue
          ?
              | (GetProperties<PropertyValue> extends infer PropertyInfo
                  ? PropertyInfo extends { path: infer SubPath; value: infer SubValue }
                    ? SubPath extends string
                      ? {
                          path: `${PropertyPath}.${SubPath}`;
                          value: SubValue;
                        }
                      : never
                    : never
                  : never)
              | {
                  path: PropertyPath;
                  value: PropertyValue;
                }
          : never
        : never
      : never) & {
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
