/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { MineUpgradeId } from "#shared/models/clicker/data/upgrade/MineUpgradeId";
import { pluralize } from "#shared/util/text/pluralize";

export const MineUpgradeMap = {
  [MineUpgradeId["Sugar Gas"]]: {
    description: `${pluralize(Target.Mine)} are **twice** as efficient.`,
    flavorDescription: "A pink, volatile gas, found in strange pockets deep underground.",
    price: 2.66e5,
    effects: [
      {
        value: 2,
        targets: [Target.Mine],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Mine, amount: 1 }],
  },
  [MineUpgradeId.Megadrill]: {
    description: `${pluralize(Target.Mine)} are **twice** as efficient.`,
    flavorDescription: "You're in deep.",
    price: 9.42e5,
    effects: [
      {
        value: 2,
        targets: [Target.Mine],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Mine, amount: 5 }],
  },
  [MineUpgradeId.Ultradrill]: {
    description: `${pluralize(Target.Mine)} are **twice** as efficient.`,
    flavorDescription: "Just how deep does this thing go?",
    price: 5.09e6,
    effects: [
      {
        value: 2,
        targets: [Target.Mine],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Mine, amount: 25 }],
  },
  [MineUpgradeId.Ultimadrill]: {
    description: `${pluralize(Target.Mine)} are **twice** as efficient.`,
    flavorDescription: "Pretty sure we're one with the planet now.",
    price: 1.1e7,
    effects: [
      {
        value: 2,
        targets: [Target.Mine],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Mine, amount: 50 }],
  },
  [MineUpgradeId["H-bomb Mining"]]: {
    description: `${pluralize(Target.Mine)} are **twice** as efficient.`,
    flavorDescription: "Questionable efficiency, but spectacular.",
    price: 2.42e7,
    effects: [
      {
        value: 2,
        targets: [Target.Mine],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Mine, amount: 100 }],
  },
} as const satisfies Record<MineUpgradeId, Except<Upgrade<MineUpgradeId>, "id">>;

export const MineUpgrades: ReadonlySet<(typeof MineUpgradeMap)[keyof typeof MineUpgradeMap]> = new Set(
  Object.values(MineUpgradeMap),
);
