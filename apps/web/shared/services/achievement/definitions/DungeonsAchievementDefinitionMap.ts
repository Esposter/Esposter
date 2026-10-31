// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { saveDungeonsInputSchema } from "#shared/models/db/dungeons/SaveDungeonsInput";
import { MonsterKeys } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { property } from "#shared/services/achievement/conditions/property";
import { defineTriggerAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { DungeonsAchievementName } from "@esposter/db-schema";

// Every dungeon achievement unlocks on a save of the dungeon game. The save is the client's own account of how play went,
// So these are claims and carry no points (`ClaimedAchievementTriggerPath`)
const defineDungeonsAchievementDefinition = defineTriggerAchievementDefinition(
  "dungeons.saveDungeons",
  saveDungeonsInputSchema,
);

// The monster level milestones differ only in threshold, so one definition serves the family
const defineMonsterLevelAchievementDefinition = ({ icon, level }: { icon: string; level: number }) =>
  defineDungeonsAchievementDefinition({
    amount: 1,
    condition: property(
      "data.save.player.monsters",
      (value) => value?.some(({ statistics }) => statistics.level >= level) ?? false,
    ),
    description: `Train a monster to level ${level} in your dungeon game`,
    icon,
    points: 0,
  });

export const DungeonsAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Dungeons, {
  [DungeonsAchievementName.DungeonCrawler]: defineDungeonsAchievementDefinition({
    amount: 1,
    description: "Save your dungeon game",
    icon: "i-mdi:sword",
    points: 0,
  }),
  [DungeonsAchievementName.DungeonHomeowner]: defineDungeonsAchievementDefinition({
    amount: 1,
    condition: property("data.save.world", (value) => {
      if (!value) return false;
      const chests = Object.values(value).flatMap(({ chestMap }) => Object.values(chestMap));
      return chests.length > 0 && chests.every(({ isOpened }) => isOpened);
    }),
    description: "Open every chest you have discovered in your dungeon game",
    icon: "i-mdi:treasure-chest-outline",
    points: 0,
  }),
  [DungeonsAchievementName.DungeonMaster]: defineDungeonsAchievementDefinition({
    amount: 50,
    description: "Save your dungeon game 50 times",
    icon: "i-mdi:castle",
    points: 0,
  }),
  [DungeonsAchievementName.MonsterCatcher]: defineDungeonsAchievementDefinition({
    amount: 1,
    // The starter is the party's first member, so a second member means a capture
    condition: property("data.save.player.monsters", (value) => (value?.length ?? 0) >= 2),
    description: "Catch your first monster in your dungeon game",
    icon: "i-mdi:pokeball",
    points: 0,
  }),
  [DungeonsAchievementName.MonsterCollector]: defineDungeonsAchievementDefinition({
    amount: 1,
    condition: property(
      "data.save.player.monsters",
      (value) => value !== undefined && MonsterKeys.every((monsterKey) => value.some(({ key }) => key === monsterKey)),
    ),
    description: "Catch every monster species in your dungeon game",
    icon: "i-mdi:book-open-page-variant",
    points: 0,
  }),
  [DungeonsAchievementName.MonsterElite]: defineMonsterLevelAchievementDefinition({
    icon: "i-mdi:shield-star",
    level: 25,
  }),
  [DungeonsAchievementName.MonsterTrainer]: defineMonsterLevelAchievementDefinition({
    icon: "i-mdi:arm-flex",
    level: 10,
  }),
});
