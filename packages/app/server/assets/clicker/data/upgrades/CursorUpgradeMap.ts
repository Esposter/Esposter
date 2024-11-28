/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { plural } from "pluralize";

export const CursorUpgradeMap = {
  [CursorUpgradeId["Reinforced Index Finger"]]: {
    description: `The ${Target.Mouse} and ${plural(Target.Cursor)} are **twice** as efficient.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 1 }],
  },
  [CursorUpgradeId["Carpal Tunnel Prevention Cream"]]: {
    description: `The ${Target.Mouse} and ${plural(Target.Cursor)} are **twice** as efficient.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 1 }],
  },
  [CursorUpgradeId.Ambidextrous]: {
    description: `The ${Target.Mouse} and ${plural(Target.Cursor)} are **twice** as efficient.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 10 }],
  },
  [CursorUpgradeId["Thousand Fingers"]]: {
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 25 }],
  },
  [CursorUpgradeId["Million Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **5**.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 50 }],
  },
  [CursorUpgradeId["Billion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **10**.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 100 }],
  },
  [CursorUpgradeId["Trillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 150 }],
  },
  [CursorUpgradeId["Quadrillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 200 }],
  },
  [CursorUpgradeId["Quintillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 250 }],
  },
  [CursorUpgradeId["Sextillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 300 }],
  },
  [CursorUpgradeId["Septillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 350 }],
  },
  [CursorUpgradeId["Octillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 400 }],
  },
  [CursorUpgradeId["Nonillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 450 }],
  },
  [CursorUpgradeId["Decillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
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
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 500 }],
  },
} as const satisfies Record<CursorUpgradeId, Except<Upgrade<CursorUpgradeId>, "id">>;
