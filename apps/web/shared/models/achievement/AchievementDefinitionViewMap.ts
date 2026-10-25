import type { AchievementDefinitionView } from "#shared/models/achievement/AchievementDefinitionView";
import type { AchievementName } from "@esposter/db-schema";

export type AchievementDefinitionViewMap = Record<AchievementName, AchievementDefinitionView>;
