import type { TRPCPaths } from "@@/server/models/trpc/TRPCPaths";
import type { TRPCRouterInputs } from "@@/server/models/trpc/TRPCRouterInputs";
import type { OpUnitType } from "dayjs";
import type { Get, PartialDeep, Paths } from "type-fest";

import { BinaryOperator, UnaryOperator } from "@esposter/db-schema";

export type AchievementCondition<TPath extends TRPCPaths> =
  | ((Paths<Get<TRPCRouterInputs, TPath>> extends infer PropertyPath
      ? PropertyPath extends string
        ? Get<TRPCRouterInputs, `${TPath}.${PropertyPath}`> extends infer PropertyValue
          ? // Iterate over all keys of the found value
            | (keyof PropertyValue extends infer PropertySubKey
                  ? PropertySubKey extends string
                    ? PropertyValue[keyof PropertyValue & PropertySubKey] extends infer SubValue
                      ? // Filter out:
                        // 1. Functions (we don't want "string.toString", "string.charAt")
                        // 2. Numeric indices (we don't want "array.0", "array.1")
                        SubValue extends Function
                        ? never
                        : PropertySubKey extends `${number}`
                          ? never
                          : {
                              path: `${PropertyPath}.${PropertySubKey}`;
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

type ConditionValue<T> = T | (T extends string | unknown[] ? { length?: number } : PartialDeep<T>);
