/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { TempleUpgradeId } from "#shared/models/clicker/data/upgrade/TempleUpgradeId";
import { plural } from "pluralize";

export const TempleUpgradeMap = {
  [TempleUpgradeId["Golden Idols"]]: {
    description: `${plural(Target.Temple)} are **twice** as efficient.`,
    flavorDescription: "Lure even the most reluctant worshippers.",
    price: 4.44e8,
    effects: [
      {
        value: 2,
        targets: [Target.Temple],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Temple, amount: 1 }],
  },
  [TempleUpgradeId.Sacrifices]: {
    description: `${plural(Target.Temple)} are **twice** as efficient.`,
    flavorDescription: "What won't you do for a few more points?",
    price: 1.57e9,
    effects: [
      {
        value: 2,
        targets: [Target.Temple],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Temple, amount: 5 }],
  },
  [TempleUpgradeId["Delicious Blessing"]]: {
    description: `${plural(Target.Temple)} are **twice** as efficient.`,
    flavorDescription: "And lo, it was good.",
    price: 8.48e9,
    effects: [
      {
        value: 2,
        targets: [Target.Temple],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Temple, amount: 25 }],
  },
  [TempleUpgradeId["Sun Festival"]]: {
    description: `${plural(Target.Temple)} are **twice** as efficient.`,
    flavorDescription: "Free tans for the whole congregation.",
    price: 1.84e10,
    effects: [
      {
        value: 2,
        targets: [Target.Temple],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Temple, amount: 50 }],
  },
  [TempleUpgradeId["Enlarged Pantheon"]]: {
    description: `${plural(Target.Temple)} are **twice** as efficient.`,
    flavorDescription: "There's always room for one more deity.",
    price: 4.04e10,
    effects: [
      {
        value: 2,
        targets: [Target.Temple],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Temple, amount: 100 }],
  },
} as const satisfies Record<TempleUpgradeId, Except<Upgrade<TempleUpgradeId>, "id">>;

export const TempleUpgrades: ReadonlySet<(typeof TempleUpgradeMap)[keyof typeof TempleUpgradeMap]> = new Set(
  Object.values(TempleUpgradeMap),
);
