import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { AchievementName } from "@esposter/db-schema";

export const DungeonsAchievementDefinitionMap = {
  [AchievementName.DungeonCrawler]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Dungeons,
    description: "Save your dungeon game",
    icon: "mdi-sword",
    points: 10,
    triggerPath: "dungeons.saveDungeons" as const,
  }),
  [AchievementName.DungeonMaster]: defineAchievementDefinition({
    amount: 50,
    category: AchievementCategory.Dungeons,
    description: "Save your dungeon game 50 times",
    icon: "mdi-castle",
    points: 100,
    triggerPath: "dungeons.saveDungeons" as const,
  }),
};
