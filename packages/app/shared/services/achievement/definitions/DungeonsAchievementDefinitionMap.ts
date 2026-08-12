import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import { MonsterKeys } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/defineAchievementDefinitionMap";
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
    condition: {
      operation: (value) => value.some(({ stats }) => stats.level >= level),
      operator: AchievementOperator.Operation,
      path: "save.player.monsters",
      type: AchievementConditionType.Property,
    },
    description: `Train a monster to level ${level} in your dungeon game`,
    icon,
    points,
    triggerPath: "dungeons.saveDungeons" as const,
  });

export const DungeonsAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Dungeons, {
  [DungeonsAchievementName.DungeonCrawler]: defineAchievementDefinition({
    amount: 1,
    description: "Save your dungeon game",
    icon: "mdi-sword",
    points: 10,
    triggerPath: "dungeons.saveDungeons" as const,
  }),
  [DungeonsAchievementName.DungeonHomeowner]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operation: (value) => {
        const chests = Object.values(value).flatMap(({ chestMap }) => Object.values(chestMap));
        return chests.length > 0 && chests.every(({ isOpened }) => isOpened);
      },
      operator: AchievementOperator.Operation,
      path: "save.world",
      type: AchievementConditionType.Property,
    },
    description: "Open every chest you have discovered in your dungeon game",
    icon: "mdi-treasure-chest-outline",
    points: 100,
    triggerPath: "dungeons.saveDungeons" as const,
  }),
  [DungeonsAchievementName.DungeonMaster]: defineAchievementDefinition({
    amount: 50,
    description: "Save your dungeon game 50 times",
    icon: "mdi-castle",
    points: 100,
    triggerPath: "dungeons.saveDungeons" as const,
  }),
  [DungeonsAchievementName.MonsterCatcher]: defineAchievementDefinition({
    amount: 1,
    condition: {
      // The starter is the party's first member, so a second member means a capture
      operation: (value) => value.length >= 2,
      operator: AchievementOperator.Operation,
      path: "save.player.monsters",
      type: AchievementConditionType.Property,
    },
    description: "Catch your first monster in your dungeon game",
    icon: "mdi-pokeball",
    points: 20,
    triggerPath: "dungeons.saveDungeons" as const,
  }),
  [DungeonsAchievementName.MonsterCollector]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operation: (value) => MonsterKeys.every((monsterKey) => value.some(({ key }) => key === monsterKey)),
      operator: AchievementOperator.Operation,
      path: "save.player.monsters",
      type: AchievementConditionType.Property,
    },
    description: "Catch every monster species in your dungeon game",
    icon: "mdi-book-open-page-variant",
    points: 200,
    triggerPath: "dungeons.saveDungeons" as const,
  }),
  [DungeonsAchievementName.MonsterElite]: defineMonsterLevelAchievementDefinition({
    icon: "mdi-shield-star",
    level: 25,
    points: 200,
  }),
  [DungeonsAchievementName.MonsterTrainer]: defineMonsterLevelAchievementDefinition({
    icon: "mdi-arm-flex",
    level: 10,
    points: 50,
  }),
});
