/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { FarmUpgradeId } from "#shared/models/clicker/data/upgrade/FarmUpgradeId";
import { plural } from "pluralize";

export const FarmUpgradeMap = {
  [FarmUpgradeId["Cheap Hoes"]]: {
    description: `${plural(Target.Farm)} are **twice** as efficient.`,
    flavorDescription: "Rake in the dough.",
    price: 2.44e4,
    effects: [
      {
        value: 2,
        targets: [Target.Farm],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Farm, amount: 1 }],
  },
  [FarmUpgradeId.Fertilizer]: {
    description: `${plural(Target.Farm)} are **twice** as efficient.`,
    flavorDescription: "It's not manure, it's premium growth formula.",
    price: 8.64e4,
    effects: [
      {
        value: 2,
        targets: [Target.Farm],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Farm, amount: 5 }],
  },
  [FarmUpgradeId["Seed Vault"]]: {
    description: `${plural(Target.Farm)} are **twice** as efficient.`,
    flavorDescription: "Doomsday-proof and pantry-approved.",
    price: 4.66e5,
    effects: [
      {
        value: 2,
        targets: [Target.Farm],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Farm, amount: 25 }],
  },
  [FarmUpgradeId["Genetically-modified Crops"]]: {
    description: `${plural(Target.Farm)} are **twice** as efficient.`,
    flavorDescription: "All-natural, mostly.",
    price: 1.01e6,
    effects: [
      {
        value: 2,
        targets: [Target.Farm],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Farm, amount: 50 }],
  },
  [FarmUpgradeId["Gingerbread Scarecrows"]]: {
    description: `${plural(Target.Farm)} are **twice** as efficient.`,
    flavorDescription: "Free labor, and the crows respect them.",
    price: 2.22e6,
    effects: [
      {
        value: 2,
        targets: [Target.Farm],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Farm, amount: 100 }],
  },
} as const satisfies Record<FarmUpgradeId, Except<Upgrade<FarmUpgradeId>, "id">>;

export const FarmUpgrades: ReadonlySet<(typeof FarmUpgradeMap)[keyof typeof FarmUpgradeMap]> = new Set(
  Object.values(FarmUpgradeMap),
);
