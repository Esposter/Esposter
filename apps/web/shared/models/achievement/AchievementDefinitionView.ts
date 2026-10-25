import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { Except } from "type-fest";

// An entry as a map holds it: the name is the map's key, so the value leaves it out
export type AchievementDefinitionView = Except<AchievementDefinitionEntry, "name">;
