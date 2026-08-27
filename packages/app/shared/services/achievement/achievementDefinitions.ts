import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

export const achievementDefinitions = parseDictionaryToArray(AchievementDefinitionMap, "name");
