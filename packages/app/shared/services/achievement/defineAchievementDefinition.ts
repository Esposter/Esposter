import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";
import type { AchievementDefinition } from "@@/server/models/achievement/AchievementDefinition";
import type { Except } from "type-fest";

export const defineAchievementDefinition = <TPath extends TRPCPaths>(
  definition: Except<AchievementDefinition<TPath>, "name">,
): Except<AchievementDefinition<TPath>, "name"> => definition;
