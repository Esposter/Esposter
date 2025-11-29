import type { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import type { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";
import type { TRPCRouterInputs } from "#shared/models/trpc/TRPCRouterInputs";
import type { RecursiveGetProperties } from "#shared/util/types/RecursiveGetProperties";
import type { BinaryOperator } from "@esposter/db-schema";
import type { Except, Get } from "type-fest";

export type PropertyCondition<TPath extends TRPCPaths> =
  | (Except<RecursiveGetProperties<Get<TRPCRouterInputs, TPath>>, "type"> & {
      operator: BinaryOperator;
      type: AchievementConditionType.Property;
    })
  | (Except<RecursiveGetProperties<Get<TRPCRouterInputs, TPath>>, "type" | "value"> &
      (
        | {
            operator: AchievementOperator.Contains;
            type: AchievementConditionType.Property;
            value: string;
          }
        | {
            operator: AchievementOperator.IsPalindrome;
            type: AchievementConditionType.Property;
            value: boolean;
          }
        | {
            operator: AchievementOperator.Matches;
            type: AchievementConditionType.Property;
            value: RegExp;
          }
      ));
