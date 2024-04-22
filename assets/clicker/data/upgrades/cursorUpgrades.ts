import { Target } from "@/models/clicker/data/Target";
import { EffectType } from "@/models/clicker/data/effect/EffectType";
import { CursorUpgradeId } from "@/models/clicker/data/upgrade/CursorUpgradeId";
import type { Upgrade } from "@/models/clicker/data/upgrade/Upgrade";

export const cursorUpgrades: Upgrade<CursorUpgradeId>[] = [
  {
    id: CursorUpgradeId["Reinforced Index Finger"],
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "prod prod",
    price: 1e2,
    effects: [
      {
        value: 2,
        targets: [Target.Mouse, Target.Cursor],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 1 }],
  },
  {
    id: CursorUpgradeId["Carpal Tunnel Prevention Cream"],
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "it... it hurts to click...",
    price: 5e2,
    effects: [
      {
        value: 2,
        targets: [Target.Mouse, Target.Cursor],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 1 }],
  },
  {
    id: CursorUpgradeId.Ambidextrous,
    description: "The mouse and cursors are **twice** as efficient.",
    flavorDescription: "Look ma, both hands!",
    price: 1e4,
    effects: [
      {
        value: 2,
        targets: [Target.Mouse, Target.Cursor],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 10 }],
  },
  {
    id: CursorUpgradeId["Thousand Fingers"],
    description: "The mouse and cursors gain **+0.1** cookies for each non-cursor object owned.",
    flavorDescription: "clickity",
    price: 1e5,
    effects: [
      {
        value: 0.1,
        targets: [Target.Mouse, Target.Cursor],
        configuration: {
          type: EffectType.BuildingAdditiveNor,
          targets: [Target.Cursor],
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 25 }],
  },
  {
    id: CursorUpgradeId["Million Fingers"],
    description: "Multiplies the gain from Thousand fingers by **5**.",
    flavorDescription: "clickityclickity",
    price: 1e7,
    effects: [
      {
        value: 5,
        targets: [CursorUpgradeId["Thousand Fingers"]],
        configuration: {
          type: EffectType.Multiplicative,
          itemType: Target.Upgrade,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 50 }],
  },
  {
    id: CursorUpgradeId["Billion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **10**.",
    flavorDescription: "clickityclickityclickity",
    price: 1e8,
    effects: [
      {
        value: 10,
        targets: [CursorUpgradeId["Thousand Fingers"]],
        configuration: {
          type: EffectType.Multiplicative,
          itemType: Target.Upgrade,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 100 }],
  },
  {
    id: CursorUpgradeId["Trillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "clickityclickityclickityclickity",
    price: 1e9,
    effects: [
      {
        value: 20,
        targets: [CursorUpgradeId["Thousand Fingers"]],
        configuration: {
          type: EffectType.Multiplicative,
          itemType: Target.Upgrade,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 150 }],
  },
  {
    id: CursorUpgradeId["Quadrillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "clickityclickityclickityclickityclick",
    price: 1e10,
    effects: [
      {
        value: 20,
        targets: [CursorUpgradeId["Thousand Fingers"]],
        configuration: {
          type: EffectType.Multiplicative,
          itemType: Target.Upgrade,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 200 }],
  },
  {
    id: CursorUpgradeId["Quintillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "man, just go click click click click click, it's real easy, man.",
    price: 1e13,
    effects: [
      {
        value: 20,
        targets: [CursorUpgradeId["Thousand Fingers"]],
        configuration: {
          type: EffectType.Multiplicative,
          itemType: Target.Upgrade,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 250 }],
  },
  {
    id: CursorUpgradeId["Sextillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "sometimes things just click",
    price: 1e16,
    effects: [
      {
        value: 20,
        targets: [CursorUpgradeId["Thousand Fingers"]],
        configuration: {
          type: EffectType.Multiplicative,
          itemType: Target.Upgrade,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 300 }],
  },
  {
    id: CursorUpgradeId["Septillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "[cursory flavor text]",
    price: 1e19,
    effects: [
      {
        value: 20,
        targets: [CursorUpgradeId["Thousand Fingers"]],
        configuration: {
          type: EffectType.Multiplicative,
          itemType: Target.Upgrade,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 350 }],
  },
  {
    id: CursorUpgradeId["Octillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "Turns out you **can** quite put your finger on it.",
    price: 1e22,
    effects: [
      {
        value: 20,
        targets: [CursorUpgradeId["Thousand Fingers"]],
        configuration: {
          type: EffectType.Multiplicative,
          itemType: Target.Upgrade,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 400 }],
  },
  {
    id: CursorUpgradeId["Nonillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "Only for the freakiest handshakes.",
    price: 1e25,
    effects: [
      {
        value: 20,
        targets: [CursorUpgradeId["Thousand Fingers"]],
        configuration: {
          type: EffectType.Multiplicative,
          itemType: Target.Upgrade,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 450 }],
  },
  {
    id: CursorUpgradeId["Decillion Fingers"],
    description: "Multiplies the gain from Thousand fingers by **20**.",
    flavorDescription: "If you still can't quite put your finger on it, you must not be trying very hard.",
    price: 1e28,
    effects: [
      {
        value: 20,
        targets: [CursorUpgradeId["Thousand Fingers"]],
        configuration: {
          type: EffectType.Multiplicative,
          itemType: Target.Upgrade,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Cursor, amount: 500 }],
  },
];
