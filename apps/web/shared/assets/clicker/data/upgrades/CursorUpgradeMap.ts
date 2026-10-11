/* eslint-disable perfectionist/sort-objects -- declaration order is the unlock order the store lists */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { CursorUpgradeId } from "#shared/models/clicker/data/upgrade/CursorUpgradeId";
import { pluralize } from "#shared/util/text/pluralize";

// Each fingers upgrade multiplies the gain from the Thousand Fingers by its own value, so its description and effect are
// written once from that value
const getFingersMultiplier = (
  value: number,
): Pick<Except<Upgrade<CursorUpgradeId>, "id">, "description" | "effects"> => ({
  description: `Multiplies the gain from ${CursorUpgradeId["Thousand Fingers"]} by **${value}**.`,
  effects: [
    {
      value,
      targets: [CursorUpgradeId["Thousand Fingers"]],
      configuration: { type: EffectType.Multiplicative, itemType: Target.Upgrade },
    },
  ],
});

export const CursorUpgradeMap = {
  [CursorUpgradeId["Reinforced Index Finger"]]: {
    description: `The ${Target.Mouse} and ${pluralize(Target.Cursor)} are **twice** as efficient.`,
    flavorDescription: "prod prod",
    price: 1e2,
    effects: [{ value: 2, targets: [Target.Mouse, Target.Cursor], configuration: { type: EffectType.Multiplicative } }],
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 1 }],
  },
  [CursorUpgradeId["Carpal Tunnel Prevention Cream"]]: {
    description: `The ${Target.Mouse} and ${pluralize(Target.Cursor)} are **twice** as efficient.`,
    flavorDescription: "it... it hurts to click...",
    price: 5e2,
    effects: [{ value: 2, targets: [Target.Mouse, Target.Cursor], configuration: { type: EffectType.Multiplicative } }],
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 1 }],
  },
  [CursorUpgradeId.Ambidextrous]: {
    description: `The ${Target.Mouse} and ${pluralize(Target.Cursor)} are **twice** as efficient.`,
    flavorDescription: "Look ma, both hands!",
    price: 1e4,
    effects: [{ value: 2, targets: [Target.Mouse, Target.Cursor], configuration: { type: EffectType.Multiplicative } }],
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
        configuration: { type: EffectType.BuildingAdditiveNor, targets: [Target.Cursor] },
      },
    ],
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 25 }],
  },
  [CursorUpgradeId["Million Fingers"]]: {
    ...getFingersMultiplier(5),
    flavorDescription: "clickityclickity",
    price: 1e7,
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 50 }],
  },
  [CursorUpgradeId["Billion Fingers"]]: {
    ...getFingersMultiplier(10),
    flavorDescription: "clickityclickityclickity",
    price: 1e8,
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 100 }],
  },
  [CursorUpgradeId["Trillion Fingers"]]: {
    ...getFingersMultiplier(20),
    flavorDescription: "clickityclickityclickityclickity",
    price: 1e9,
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 150 }],
  },
  [CursorUpgradeId["Quadrillion Fingers"]]: {
    ...getFingersMultiplier(20),
    flavorDescription: "clickityclickityclickityclickityclick",
    price: 1e10,
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 200 }],
  },
  [CursorUpgradeId["Quintillion Fingers"]]: {
    ...getFingersMultiplier(20),
    flavorDescription: "man, just go click click click click click, it's real easy, man.",
    price: 1e13,
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 250 }],
  },
  [CursorUpgradeId["Sextillion Fingers"]]: {
    ...getFingersMultiplier(20),
    flavorDescription: "sometimes things just click",
    price: 1e16,
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 300 }],
  },
  [CursorUpgradeId["Septillion Fingers"]]: {
    ...getFingersMultiplier(20),
    flavorDescription: "[cursory flavor text]",
    price: 1e19,
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 350 }],
  },
  [CursorUpgradeId["Octillion Fingers"]]: {
    ...getFingersMultiplier(20),
    flavorDescription: "Turns out you **can** quite put your finger on it.",
    price: 1e22,
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 400 }],
  },
  [CursorUpgradeId["Nonillion Fingers"]]: {
    ...getFingersMultiplier(20),
    flavorDescription: "Only for the freakiest handshakes.",
    price: 1e25,
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 450 }],
  },
  [CursorUpgradeId["Decillion Fingers"]]: {
    ...getFingersMultiplier(20),
    flavorDescription: "If you still can't quite put your finger on it, you must not be trying very hard.",
    price: 1e28,
    unlockConditions: [{ id: Target.Cursor, type: Target.Building, amount: 500 }],
  },
} as const satisfies Record<CursorUpgradeId, Except<Upgrade<CursorUpgradeId>, "id">>;

export const CursorUpgrades = Object.values(CursorUpgradeMap);
