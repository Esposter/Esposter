import type { BuildingWithStatistics } from "#shared/models/clicker/data/building/BuildingWithStatistics";
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";

import { Target } from "#shared/models/clicker/data/Target";
import { exhaustiveGuard } from "@esposter/shared";

// An upgrade is unlocked once every one of its conditions holds against the buildings owned and the upgrades bought
export const getUnlockedUpgrades = (
  upgrades: Upgrade[],
  boughtBuildings: BuildingWithStatistics[],
  boughtUpgrades: Upgrade[],
) =>
  upgrades.filter(({ unlockConditions }) =>
    unlockConditions.every((unlockCondition) => {
      const { type } = unlockCondition;

      switch (type) {
        case Target.Building: {
          const foundBuilding = boughtBuildings.find(({ id }) => id === unlockCondition.id);
          if (foundBuilding) return foundBuilding.amount >= unlockCondition.amount;
          else return false;
        }
        case Target.Upgrade:
          return boughtUpgrades.some(({ id }) => id === unlockCondition.id);
        default:
          return exhaustiveGuard(type);
      }
    }),
  );
