// @unocss-include
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { BuildingIds } from "#shared/models/clicker/data/building/BuildingId";
import { saveClickerInputSchema } from "#shared/models/db/clicker/SaveClickerInput";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { property } from "#shared/services/achievement/conditions/property";
import { defineTriggerAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { ClickerAchievementName } from "@esposter/db-schema";

// Every clicker achievement unlocks on a save of the clicker game. The save is the client's own account of how play went,
// So these are claims and carry no points (`ClaimedAchievementTriggerPath`)
const defineClickerAchievementDefinition = defineTriggerAchievementDefinition(
  "clicker.saveClicker",
  saveClickerInputSchema,
);

export const ClickerAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Clicker, {
  [ClickerAchievementName.ClickerAddict]: defineClickerAchievementDefinition({
    amount: 100,
    description: "Save your clicker game 100 times",
    icon: "i-mdi:cursor-pointer",
    points: 0,
  }),
  [ClickerAchievementName.ClickerArchitect]: defineClickerAchievementDefinition({
    amount: 1,
    condition: property("data.boughtBuildings", (value) =>
      BuildingIds.every((buildingId) => value.some(({ id }) => id === buildingId)),
    ),
    description: "Own every building in your clicker game",
    icon: "i-mdi:city",
    points: 0,
  }),
  [ClickerAchievementName.ClickerBillionaire]: defineClickerAchievementDefinition({
    amount: 1,
    condition: property("data.pointCount", isAtLeast(1e9)),
    description: "Hold 1,000,000,000 points in your clicker game",
    icon: "i-mdi:cash-multiple",
    points: 0,
  }),
  [ClickerAchievementName.ClickerChampion]: defineClickerAchievementDefinition({
    amount: 1000,
    description: "Save your clicker game 1000 times",
    icon: "i-mdi:crown",
    points: 0,
  }),
  [ClickerAchievementName.ClickerCompletionist]: defineClickerAchievementDefinition({
    amount: 1,
    condition: property("data.boughtUpgrades", (value) =>
      Object.keys(UpgradeMap).every((upgradeId) => value.some((id) => id === upgradeId)),
    ),
    description: "Buy every upgrade in your clicker game",
    icon: "i-mdi:check-decagram",
    points: 0,
  }),
  [ClickerAchievementName.ClickerMillionaire]: defineClickerAchievementDefinition({
    amount: 1,
    condition: property("data.pointCount", isAtLeast(1e6)),
    description: "Hold 1,000,000 points in your clicker game",
    icon: "i-mdi:cash",
    points: 0,
  }),
  [ClickerAchievementName.ClickerNovice]: defineClickerAchievementDefinition({
    amount: 1,
    description: "Save your clicker game for the first time",
    icon: "i-mdi:cursor-default-outline",
    points: 0,
  }),
  [ClickerAchievementName.ClickerPro]: defineClickerAchievementDefinition({
    amount: 10,
    description: "Save your clicker game 10 times",
    icon: "i-mdi:cursor-default-click",
    points: 0,
  }),
  [ClickerAchievementName.ClickerSaver]: defineClickerAchievementDefinition({
    amount: 5,
    description: "Save your clicker game 5 times",
    icon: "i-mdi:content-save-all",
    points: 0,
  }),
  [ClickerAchievementName.ClickerTrillionaire]: defineClickerAchievementDefinition({
    amount: 1,
    condition: property("data.pointCount", isAtLeast(1e12)),
    description: "Hold 1,000,000,000,000 points in your clicker game",
    icon: "i-mdi:treasure-chest",
    points: 0,
  }),
});
