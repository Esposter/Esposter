import type { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import type { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";
import type { TRPCRouterInputs } from "#shared/models/trpc/TRPCRouterInputs";
import type { BinaryOperator } from "@esposter/db-schema";
import type { GetProperties, ItemEntityType } from "@esposter/shared";
import type { Get } from "type-fest";

export type PropertyCondition<TPath extends TRPCPaths> =
  GetProperties<Get<TRPCRouterInputs, TPath>> extends infer R
    ? R extends { path: infer Path extends string; value: infer Value }
      ? ItemEntityType<AchievementConditionType.Property> &
          (
            | {
                operation: (value: Value) => boolean;
                operator: AchievementOperator.Operation;
              }
            | {
                operator: AchievementOperator.Contains;
                value: string;
              }
            | {
                operator: AchievementOperator.IsPalindrome;
                value: boolean;
              }
            | {
                operator: AchievementOperator.Matches;
                value: RegExp;
              }
            | {
                operator: BinaryOperator;
                value: Value;
              }
          ) & {
            path: Path;
          }
      : never
    : never;
