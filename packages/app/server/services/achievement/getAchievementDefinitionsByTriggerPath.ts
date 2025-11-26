import type { TrpcPath } from "@/models/trpc/TrpcPath";
import type { AchievementDefinition } from "@@/server/models/achievement/AchievementDefinition";

import { AchievementName } from "@esposter/db-schema";
import { AchievementDefinitionMap } from "~~/server/services/achievement/AchievementDefinitionMap";

export const getAchievementDefinitionsByTriggerPath = (triggerPath: TrpcPath): AchievementDefinition[] =>
  (Object.entries(AchievementDefinitionMap) as [AchievementName, Omit<AchievementDefinition, "name">][])
    .filter(([, def]) => def.triggerPath === triggerPath)
    .map(([name, def]) => ({ ...def, name }));
