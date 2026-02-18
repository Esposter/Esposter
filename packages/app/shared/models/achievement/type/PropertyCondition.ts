import type { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import type { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";
import type { TRPCRouterInputs } from "#shared/models/trpc/TRPCRouterInputs";
import type { RecursiveGetProperties } from "#shared/util/types/RecursiveGetProperties";
import type { BinaryOperator } from "@esposter/db-schema";
import type { Except, Get } from "type-fest";

export type PropertyCondition<TPath extends TRPCPaths> =
  Except<RecursiveGetProperties<Get<TRPCRouterInputs, TPath>>, "type"> extends { path: infer Path; value: infer Value }
    ? Path extends string
      ? (
          | {
              operation: (value: Get<TRPCRouterInputs, `${TPath}.${Path}`>) => boolean;
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
          type: AchievementConditionType.Property;
        }
      : never
    : never;
