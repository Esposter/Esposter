import type { Upgrade } from "@/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "@/models/clicker/data/effect/EffectType";
import { Target } from "@/models/clicker/data/Target";
import { CursorUpgradeId } from "@/models/clicker/data/upgrade/CursorUpgradeId";
import { plural } from "pluralize";

export const CursorUpgradeMap = {
  [CursorUpgradeId.Ambidextrous]: {
    description: `The ${Target.Mouse} and ${plural(Target.Cursor)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Mouse, Target.Cursor],
        value: 2,
      },
    ],
    flavorDescription: "Look ma, both hands!",
    price: 1e4,
    unlockConditions: [{ amount: 10, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Billion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **10**.`,
    effects: [
      {
        configuration: {
          itemType: Target.Upgrade,
          type: EffectType.Multiplicative,
        },
        targets: [CursorUpgradeId["Thousand Fingers"]],
        value: 10,
      },
    ],
    flavorDescription: "clickityclickityclickity",
    price: 1e8,
    unlockConditions: [{ amount: 100, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Carpal Tunnel Prevention Cream"]]: {
    description: `The ${Target.Mouse} and ${plural(Target.Cursor)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Mouse, Target.Cursor],
        value: 2,
      },
    ],
    flavorDescription: "it... it hurts to click...",
    price: 5e2,
    unlockConditions: [{ amount: 1, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Decillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
    effects: [
      {
        configuration: {
          itemType: Target.Upgrade,
          type: EffectType.Multiplicative,
        },
        targets: [CursorUpgradeId["Thousand Fingers"]],
        value: 20,
      },
    ],
    flavorDescription: "If you still can't quite put your finger on it, you must not be trying very hard.",
    price: 1e28,
    unlockConditions: [{ amount: 500, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Million Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **5**.`,
    effects: [
      {
        configuration: {
          itemType: Target.Upgrade,
          type: EffectType.Multiplicative,
        },
        targets: [CursorUpgradeId["Thousand Fingers"]],
        value: 5,
      },
    ],
    flavorDescription: "clickityclickity",
    price: 1e7,
    unlockConditions: [{ amount: 50, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Nonillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
    effects: [
      {
        configuration: {
          itemType: Target.Upgrade,
          type: EffectType.Multiplicative,
        },
        targets: [CursorUpgradeId["Thousand Fingers"]],
        value: 20,
      },
    ],
    flavorDescription: "Only for the freakiest handshakes.",
    price: 1e25,
    unlockConditions: [{ amount: 450, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Octillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
    effects: [
      {
        configuration: {
          itemType: Target.Upgrade,
          type: EffectType.Multiplicative,
        },
        targets: [CursorUpgradeId["Thousand Fingers"]],
        value: 20,
      },
    ],
    flavorDescription: "Turns out you **can** quite put your finger on it.",
    price: 1e22,
    unlockConditions: [{ amount: 400, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Quadrillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
    effects: [
      {
        configuration: {
          itemType: Target.Upgrade,
          type: EffectType.Multiplicative,
        },
        targets: [CursorUpgradeId["Thousand Fingers"]],
        value: 20,
      },
    ],
    flavorDescription: "clickityclickityclickityclickityclick",
    price: 1e10,
    unlockConditions: [{ amount: 200, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Quintillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
    effects: [
      {
        configuration: {
          itemType: Target.Upgrade,
          type: EffectType.Multiplicative,
        },
        targets: [CursorUpgradeId["Thousand Fingers"]],
        value: 20,
      },
    ],
    flavorDescription: "man, just go click click click click click, it's real easy, man.",
    price: 1e13,
    unlockConditions: [{ amount: 250, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Reinforced Index Finger"]]: {
    description: `The ${Target.Mouse} and ${plural(Target.Cursor)} are **twice** as efficient.`,
    effects: [
      {
        configuration: {
          type: EffectType.Multiplicative,
        },
        targets: [Target.Mouse, Target.Cursor],
        value: 2,
      },
    ],
    flavorDescription: "prod prod",
    price: 1e2,
    unlockConditions: [{ amount: 1, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Septillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
    effects: [
      {
        configuration: {
          itemType: Target.Upgrade,
          type: EffectType.Multiplicative,
        },
        targets: [CursorUpgradeId["Thousand Fingers"]],
        value: 20,
      },
    ],
    flavorDescription: "[cursory flavor text]",
    price: 1e19,
    unlockConditions: [{ amount: 350, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Sextillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
    effects: [
      {
        configuration: {
          itemType: Target.Upgrade,
          type: EffectType.Multiplicative,
        },
        targets: [CursorUpgradeId["Thousand Fingers"]],
        value: 20,
      },
    ],
    flavorDescription: "sometimes things just click",
    price: 1e16,
    unlockConditions: [{ amount: 300, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Thousand Fingers"]]: {
    description: "The mouse and cursors gain **+0.1** cookies for each non-cursor object owned.",
    effects: [
      {
        configuration: {
          targets: [Target.Cursor],
          type: EffectType.BuildingAdditiveNor,
        },
        targets: [Target.Mouse, Target.Cursor],
        value: 0.1,
      },
    ],
    flavorDescription: "clickity",
    price: 1e5,
    unlockConditions: [{ amount: 25, id: Target.Cursor, type: Target.Building }],
  },
  [CursorUpgradeId["Trillion Fingers"]]: {
    description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **20**.`,
    effects: [
      {
        configuration: {
          itemType: Target.Upgrade,
          type: EffectType.Multiplicative,
        },
        targets: [CursorUpgradeId["Thousand Fingers"]],
        value: 20,
      },
    ],
    flavorDescription: "clickityclickityclickityclickity",
    price: 1e9,
    unlockConditions: [{ amount: 150, id: Target.Cursor, type: Target.Building }],
  },
} as const satisfies Record<CursorUpgradeId, Except<Upgrade<CursorUpgradeId>, "id">>;
