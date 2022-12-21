import type { Upgrade } from "@/models/clicker";
import { UpgradeName, UpgradeTarget, UpgradeType } from "@/models/clicker";

export const upgrades: Upgrade[] = [
  {
    name: UpgradeName["Reinforced Index Finger"],
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "prod prod",
    price: 100,
    value: 2,
    upgradeTargets: [UpgradeTarget.Mouse, UpgradeTarget.Cursor],
    upgradeConfiguration: {
      upgradeType: UpgradeType.Multiplicative,
    },
  },
  {
    name: UpgradeName["Carpal Tunnel Prevention Cream"],
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "it... it hurts to click...",
    price: 500,
    value: 2,
    upgradeTargets: [UpgradeTarget.Mouse, UpgradeTarget.Cursor],
    upgradeConfiguration: {
      upgradeType: UpgradeType.Multiplicative,
    },
  },
  {
    name: UpgradeName.Ambidextrous,
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "Look ma, both hands!",
    price: 10000,
    value: 2,
    upgradeTargets: [UpgradeTarget.Mouse, UpgradeTarget.Cursor],
    upgradeConfiguration: {
      upgradeType: UpgradeType.Multiplicative,
    },
  },
  {
    name: UpgradeName["Thousand Fingers"],
    description: "The mouse and cursors gain **+0.1** cookies for each non-cursor object owned.",
    flavorDescription: "clickity",
    price: 100000,
    value: 0.1,
    upgradeTargets: [UpgradeTarget.Mouse, UpgradeTarget.Cursor],
    upgradeConfiguration: {
      upgradeType: UpgradeType.BuildingAdditiveNor,
      affectedUpgradeTargets: [UpgradeTarget.Cursor],
    },
  },
];
