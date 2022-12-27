import type { Upgrade } from "@/models/clicker";
import { CursorUpgradeName, UpgradeTarget, UpgradeType } from "@/models/clicker";

export const upgrades: Upgrade[] = [
  {
    name: CursorUpgradeName["Reinforced Index Finger"],
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "prod prod",
    price: 1e2,
    value: 2,
    upgradeTargets: [UpgradeTarget.Mouse, UpgradeTarget.Cursor],
    upgradeConfiguration: {
      upgradeType: UpgradeType.Multiplicative,
    },
  },
  {
    name: CursorUpgradeName["Carpal Tunnel Prevention Cream"],
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "it... it hurts to click...",
    price: 5e2,
    value: 2,
    upgradeTargets: [UpgradeTarget.Mouse, UpgradeTarget.Cursor],
    upgradeConfiguration: {
      upgradeType: UpgradeType.Multiplicative,
    },
  },
  {
    name: CursorUpgradeName.Ambidextrous,
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "Look ma, both hands!",
    price: 1e4,
    value: 2,
    upgradeTargets: [UpgradeTarget.Mouse, UpgradeTarget.Cursor],
    upgradeConfiguration: {
      upgradeType: UpgradeType.Multiplicative,
    },
  },
  {
    name: CursorUpgradeName["Thousand Fingers"],
    description: "The mouse and cursors gain **+0.1** cookies for each non-cursor object owned.",
    flavorDescription: "clickity",
    price: 1e5,
    value: 0.1,
    upgradeTargets: [UpgradeTarget.Mouse, UpgradeTarget.Cursor],
    upgradeConfiguration: {
      upgradeType: UpgradeType.BuildingAdditiveNor,
      affectedUpgradeTargets: [UpgradeTarget.Cursor],
    },
  },
  {
    name: CursorUpgradeName["Million Fingers"],
    description: "Multiplies the gain from Thousand fingers by **5**.",
    flavorDescription: "clickityclickity",
    price: 1e7,
    value: 5,
    upgradeTargets: [UpgradeTarget["Thousand Fingers"]],
    upgradeConfiguration: {
      upgradeType: UpgradeType.UpgradeMultiplier,
    },
  },
  {
    name: CursorUpgradeName["Billion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **10**.",
    flavorDescription: "clickityclickityclickity",
    price: 1e8,
    value: 10,
    upgradeTargets: [UpgradeTarget["Thousand Fingers"]],
    upgradeConfiguration: {
      upgradeType: UpgradeType.UpgradeMultiplier,
    },
  },
  {
    name: CursorUpgradeName["Trillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "clickityclickityclickityclickity",
    price: 1e9,
    value: 20,
    upgradeTargets: [UpgradeTarget["Thousand Fingers"]],
    upgradeConfiguration: {
      upgradeType: UpgradeType.UpgradeMultiplier,
    },
  },
  {
    name: CursorUpgradeName["Quadrillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "clickityclickityclickityclickityclick",
    price: 1e10,
    value: 20,
    upgradeTargets: [UpgradeTarget["Thousand Fingers"]],
    upgradeConfiguration: {
      upgradeType: UpgradeType.UpgradeMultiplier,
    },
  },
  {
    name: CursorUpgradeName["Quintillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "man, just go click click click click click, it's real easy, man.",
    price: 1e13,
    value: 20,
    upgradeTargets: [UpgradeTarget["Thousand Fingers"]],
    upgradeConfiguration: {
      upgradeType: UpgradeType.UpgradeMultiplier,
    },
  },
  {
    name: CursorUpgradeName["Sextillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "sometimes things just click",
    price: 1e16,
    value: 20,
    upgradeTargets: [UpgradeTarget["Thousand Fingers"]],
    upgradeConfiguration: {
      upgradeType: UpgradeType.UpgradeMultiplier,
    },
  },
  {
    name: CursorUpgradeName["Septillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "[cursory flavor text]",
    price: 1e19,
    value: 20,
    upgradeTargets: [UpgradeTarget["Thousand Fingers"]],
    upgradeConfiguration: {
      upgradeType: UpgradeType.UpgradeMultiplier,
    },
  },
  {
    name: CursorUpgradeName["Octillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "Turns out you **can** quite put your finger on it.",
    price: 1e22,
    value: 20,
    upgradeTargets: [UpgradeTarget["Thousand Fingers"]],
    upgradeConfiguration: {
      upgradeType: UpgradeType.UpgradeMultiplier,
    },
  },
  {
    name: CursorUpgradeName["Nonillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "Only for the freakiest handshakes.",
    price: 1e25,
    value: 20,
    upgradeTargets: [UpgradeTarget["Thousand Fingers"]],
    upgradeConfiguration: {
      upgradeType: UpgradeType.UpgradeMultiplier,
    },
  },
  {
    name: CursorUpgradeName["Decillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "If you still can't quite put your finger on it, you must not be trying very hard.",
    price: 1e28,
    value: 20,
    upgradeTargets: [UpgradeTarget["Thousand Fingers"]],
    upgradeConfiguration: {
      upgradeType: UpgradeType.UpgradeMultiplier,
    },
  },
];
