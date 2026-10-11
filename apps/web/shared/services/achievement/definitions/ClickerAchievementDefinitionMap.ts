// @unocss-include
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { BuildingIds } from "#shared/models/clicker/data/building/BuildingId";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { ClickerAchievementName } from "@esposter/db-schema";
import { saveClickerInputSchema } from "#shared/models/db/clicker/SaveClickerInput";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { property } from "#shared/services/achievement/conditions/property";

export const ClickerAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Clicker, {
  [ClickerAchievementName.ClickerAddict]: defineAchievementDefinition({
    amount: 100,
    description: "Save your clicker game 100 times",
    icon: "i-mdi:cursor-pointer",
    points: 50,
    inputSchema: saveClickerInputSchema,
    triggerPath: "clicker.saveClicker",
  }),
  [ClickerAchievementName.ClickerArchitect]: defineAchievementDefinition({
    amount: 1,
    condition: property("data.boughtBuildings", (value) =>
      BuildingIds.every((buildingId) => value.some(({ id }) => id === buildingId)),
    ),
    description: "Own every building in your clicker game",
    icon: "i-mdi:city",
    points: 100,
    inputSchema: saveClickerInputSchema,
    triggerPath: "clicker.saveClicker",
  }),
  [ClickerAchievementName.ClickerBillionaire]: defineAchievementDefinition({
    amount: 1,
    condition: property("data.pointCount", isAtLeast(1e9)),
    description: "Hold 1,000,000,000 points in your clicker game",
    icon: "i-mdi:cash-multiple",
    points: 150,
    inputSchema: saveClickerInputSchema,
    triggerPath: "clicker.saveClicker",
  }),
  [ClickerAchievementName.ClickerChampion]: defineAchievementDefinition({
    amount: 1000,
    description: "Save your clicker game 1000 times",
    icon: "i-mdi:crown",
    points: 500,
    inputSchema: saveClickerInputSchema,
    triggerPath: "clicker.saveClicker",
  }),
  [ClickerAchievementName.ClickerCompletionist]: defineAchievementDefinition({
    amount: 1,
    condition: property("data.boughtUpgrades", (value) =>
      Object.keys(UpgradeMap).every((upgradeId) => value.some((id) => id === upgradeId)),
    ),
    description: "Buy every upgrade in your clicker game",
    icon: "i-mdi:check-decagram",
    points: 500,
    inputSchema: saveClickerInputSchema,
    triggerPath: "clicker.saveClicker",
  }),
  [ClickerAchievementName.ClickerMillionaire]: defineAchievementDefinition({
    amount: 1,
    condition: property("data.pointCount", isAtLeast(1e6)),
    description: "Hold 1,000,000 points in your clicker game",
    icon: "i-mdi:cash",
    points: 50,
    inputSchema: saveClickerInputSchema,
    triggerPath: "clicker.saveClicker",
  }),
  [ClickerAchievementName.ClickerNovice]: defineAchievementDefinition({
    amount: 1,
    description: "Save your clicker game for the first time",
    icon: "i-mdi:cursor-default-outline",
    points: 5,
    inputSchema: saveClickerInputSchema,
    triggerPath: "clicker.saveClicker",
  }),
  [ClickerAchievementName.ClickerPro]: defineAchievementDefinition({
    amount: 10,
    description: "Save your clicker game 10 times",
    icon: "i-mdi:cursor-default-click",
    points: 20,
    inputSchema: saveClickerInputSchema,
    triggerPath: "clicker.saveClicker",
  }),
  [ClickerAchievementName.ClickerSaver]: defineAchievementDefinition({
    amount: 5,
    description: "Save your clicker game 5 times",
    icon: "i-mdi:content-save-all",
    points: 10,
    inputSchema: saveClickerInputSchema,
    triggerPath: "clicker.saveClicker",
  }),
  [ClickerAchievementName.ClickerTrillionaire]: defineAchievementDefinition({
    amount: 1,
    condition: property("data.pointCount", isAtLeast(1e12)),
    description: "Hold 1,000,000,000,000 points in your clicker game",
    icon: "i-mdi:treasure-chest",
    points: 400,
    inputSchema: saveClickerInputSchema,
    triggerPath: "clicker.saveClicker",
  }),
});
