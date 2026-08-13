import type { AchievementDefinition } from "#shared/models/achievement/AchievementDefinition";
import type { TRPCPaths } from "#shared/models/trpc/TRPCPaths";
import type { Except } from "type-fest";
// The category comes from the map this definition is declared in (defineAchievementDefinitionMap); the
// Identity is for inference, pinning TPath from triggerPath so condition.path and value narrow with it
export const defineAchievementDefinition = <TPath extends TRPCPaths>(
  definition: Except<AchievementDefinition<TPath>, "category" | "name">,
): Except<AchievementDefinition<TPath>, "category" | "name"> => definition;
