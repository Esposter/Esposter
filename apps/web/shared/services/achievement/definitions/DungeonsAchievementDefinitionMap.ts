// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { saveDungeonsInputSchema } from "#shared/models/db/dungeons/SaveDungeonsInput";
import { MonsterKeys } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { property } from "#shared/services/achievement/conditions/property";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { DungeonsAchievementName } from "@esposter/db-schema";

// The monster level milestones differ only in threshold and reward, so one definition serves the family
const defineMonsterLevelAchievementDefinition = ({
  icon,
  level,
  points,
}: {
  icon: string;
  level: number;
  points: number;
}) =>
  defineAchievementDefinition({
    amount: 1,
    condition: property(
      "data.save.player.monsters",
      (value) => value?.some(({ statistics }) => statistics.level >= level) ?? false,
    ),
    description: `Train a monster to level ${level} in your dungeon game`,
    icon,
    inputSchema: saveDungeonsInputSchema,
    points,
    triggerPath: "dungeons.saveDungeons",
  });

export const DungeonsAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Dungeons, {
  [DungeonsAchievementName.DungeonCrawler]: defineAchievementDefinition({
    amount: 1,
    description: "Save your dungeon game",
    icon: "i-mdi:sword",
    inputSchema: saveDungeonsInputSchema,
    points: 10,
    triggerPath: "dungeons.saveDungeons",
  }),
  [DungeonsAchievementName.DungeonHomeowner]: defineAchievementDefinition({
    amount: 1,
    condition: property("data.save.world", (value) => {
      if (!value) return false;
      const chests = Object.values(value).flatMap(({ chestMap }) => Object.values(chestMap));
      return chests.length > 0 && chests.every(({ isOpened }) => isOpened);
    }),
    description: "Open every chest you have discovered in your dungeon game",
    icon: "i-mdi:treasure-chest-outline",
    inputSchema: saveDungeonsInputSchema,
    points: 100,
    triggerPath: "dungeons.saveDungeons",
  }),
  [DungeonsAchievementName.DungeonMaster]: defineAchievementDefinition({
    amount: 50,
    description: "Save your dungeon game 50 times",
    icon: "i-mdi:castle",
    inputSchema: saveDungeonsInputSchema,
    points: 100,
    triggerPath: "dungeons.saveDungeons",
  }),
  [DungeonsAchievementName.MonsterCatcher]: defineAchievementDefinition({
    amount: 1,
    // The starter is the party's first member, so a second member means a capture
    condition: property("data.save.player.monsters", (value) => (value?.length ?? 0) >= 2),
    description: "Catch your first monster in your dungeon game",
    icon: "i-mdi:pokeball",
    inputSchema: saveDungeonsInputSchema,
    points: 20,
    triggerPath: "dungeons.saveDungeons",
  }),
  [DungeonsAchievementName.MonsterCollector]: defineAchievementDefinition({
    amount: 1,
    condition: property(
      "data.save.player.monsters",
      (value) => value !== undefined && MonsterKeys.every((monsterKey) => value.some(({ key }) => key === monsterKey)),
    ),
    description: "Catch every monster species in your dungeon game",
    icon: "i-mdi:book-open-page-variant",
    inputSchema: saveDungeonsInputSchema,
    points: 200,
    triggerPath: "dungeons.saveDungeons",
  }),
  [DungeonsAchievementName.MonsterElite]: defineMonsterLevelAchievementDefinition({
    icon: "i-mdi:shield-star",
    level: 25,
    points: 200,
  }),
  [DungeonsAchievementName.MonsterTrainer]: defineMonsterLevelAchievementDefinition({
    icon: "i-mdi:arm-flex",
    level: 10,
    points: 50,
  }),
});
