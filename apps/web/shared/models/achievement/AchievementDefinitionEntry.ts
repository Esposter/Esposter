import type { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";

// One registered definition, as the array the map parses into carries it: the generic parameter each entry was
// Declared with is already fixed, so readers name the element rather than re-deriving it off the array.
export type AchievementDefinitionEntry = (typeof achievementDefinitions)[number];
