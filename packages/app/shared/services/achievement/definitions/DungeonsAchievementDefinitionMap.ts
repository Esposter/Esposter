import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { DungeonsAchievementName } from "@esposter/db-schema";

export const DungeonsAchievementDefinitionMap = {
  [DungeonsAchievementName.DungeonCrawler]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Dungeons,
    description: "Save your dungeon game",
    icon: "mdi-sword",
    points: 10,
    triggerPath: "dungeons.saveDungeons" as const,
  }),
  [DungeonsAchievementName.DungeonMaster]: defineAchievementDefinition({
    amount: 50,
    category: AchievementCategory.Dungeons,
    description: "Save your dungeon game 50 times",
    icon: "mdi-castle",
    points: 100,
    triggerPath: "dungeons.saveDungeons" as const,
  }),
};
