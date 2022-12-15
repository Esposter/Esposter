import type { Upgrade } from "@/models/clicker";
import { UpgradeTarget, UpgradeType } from "@/models/clicker";

export const upgrades: Upgrade[] = [
  {
    name: "Reinforced Index Finger",
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "prod prod",
    price: 100,
    value: 2,
    upgradeTargets: [UpgradeTarget.Cursor, UpgradeTarget.Building],
    upgradeType: UpgradeType.Multiplicative,
  },
  {
    name: "Carpal Tunnel Prevention Cream",
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "it... it hurts to click...",
    price: 500,
    value: 2,
    upgradeTargets: [UpgradeTarget.Cursor, UpgradeTarget.Building],
    upgradeType: UpgradeType.Multiplicative,
  },
  {
    name: "Ambidextrous",
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "Look ma, both hands!",
    price: 10000,
    value: 2,
    upgradeTargets: [UpgradeTarget.Cursor, UpgradeTarget.Building],
    upgradeType: UpgradeType.Multiplicative,
  },
];
