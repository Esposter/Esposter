import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import { BuildingIds } from "#shared/models/clicker/data/building/BuildingId";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/defineAchievementDefinitionMap";
import { BinaryOperator, ClickerAchievementName } from "@esposter/db-schema";

export const ClickerAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Clicker, {
  [ClickerAchievementName.ClickerAddict]: defineAchievementDefinition({
    amount: 100,
    description: "Save your clicker game 100 times",
    icon: "mdi-cursor-pointer",
    points: 50,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerArchitect]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operation: (value) => BuildingIds.every((buildingId) => value.some(({ id }) => id === buildingId)),
      operator: AchievementOperator.Operation,
      path: "boughtBuildings",
      type: AchievementConditionType.Property,
    },
    description: "Own every building in your clicker game",
    icon: "mdi-city",
    points: 100,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerBillionaire]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operator: BinaryOperator.ge,
      path: "noPoints",
      type: AchievementConditionType.Property,
      value: 1e9,
    },
    description: "Hold 1,000,000,000 points in your clicker game",
    icon: "mdi-cash-multiple",
    points: 150,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerChampion]: defineAchievementDefinition({
    amount: 1000,
    description: "Save your clicker game 1000 times",
    icon: "mdi-crown",
    points: 500,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerCompletionist]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operation: (value) => Object.keys(UpgradeMap).every((upgradeId) => value.some((id) => id === upgradeId)),
      operator: AchievementOperator.Operation,
      path: "boughtUpgrades",
      type: AchievementConditionType.Property,
    },
    description: "Buy every upgrade in your clicker game",
    icon: "mdi-check-decagram",
    points: 500,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerMillionaire]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operator: BinaryOperator.ge,
      path: "noPoints",
      type: AchievementConditionType.Property,
      value: 1e6,
    },
    description: "Hold 1,000,000 points in your clicker game",
    icon: "mdi-cash",
    points: 50,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerNovice]: defineAchievementDefinition({
    amount: 1,
    description: "Save your clicker game for the first time",
    icon: "mdi-cursor-default-outline",
    points: 5,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerPro]: defineAchievementDefinition({
    amount: 10,
    description: "Save your clicker game 10 times",
    icon: "mdi-cursor-default-click",
    points: 20,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerSaver]: defineAchievementDefinition({
    amount: 5,
    description: "Save your clicker game 5 times",
    icon: "mdi-content-save-all",
    points: 10,
    triggerPath: "clicker.saveClicker" as const,
  }),
  [ClickerAchievementName.ClickerTrillionaire]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operator: BinaryOperator.ge,
      path: "noPoints",
      type: AchievementConditionType.Property,
      value: 1e12,
    },
    description: "Hold 1,000,000,000,000 points in your clicker game",
    icon: "mdi-treasure-chest",
    points: 400,
    triggerPath: "clicker.saveClicker" as const,
  }),
});
