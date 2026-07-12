/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { AlchemyLabUpgradeId } from "#shared/models/clicker/data/upgrade/AlchemyLabUpgradeId";
import { plural } from "pluralize";

export const AlchemyLabUpgradeMap = {
  [AlchemyLabUpgradeId.Antimony]: {
    description: `${plural(Target["Alchemy Lab"])} are **twice** as efficient.`,
    flavorDescription: "Actually worth a lot of money.",
    price: 1.66e12,
    effects: [
      {
        value: 2,
        targets: [Target["Alchemy Lab"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Alchemy Lab"], amount: 1 }],
  },
  [AlchemyLabUpgradeId["Essence of Dough"]]: {
    description: `${plural(Target["Alchemy Lab"])} are **twice** as efficient.`,
    flavorDescription: "Extracted through the five ancient steps of alchemical baking.",
    price: 5.89e12,
    effects: [
      {
        value: 2,
        targets: [Target["Alchemy Lab"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Alchemy Lab"], amount: 5 }],
  },
  [AlchemyLabUpgradeId["True Chocolate"]]: {
    description: `${plural(Target["Alchemy Lab"])} are **twice** as efficient.`,
    flavorDescription: "The purest form of matter.",
    price: 3.18e13,
    effects: [
      {
        value: 2,
        targets: [Target["Alchemy Lab"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Alchemy Lab"], amount: 25 }],
  },
  [AlchemyLabUpgradeId.Ambrosia]: {
    description: `${plural(Target["Alchemy Lab"])} are **twice** as efficient.`,
    flavorDescription: "Adding this to your recipes should make them fit for the gods.",
    price: 6.9e13,
    effects: [
      {
        value: 2,
        targets: [Target["Alchemy Lab"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Alchemy Lab"], amount: 50 }],
  },
  [AlchemyLabUpgradeId["Aqua Crustulae"]]: {
    description: `${plural(Target["Alchemy Lab"])} are **twice** as efficient.`,
    flavorDescription: "Careful with the dosage.",
    price: 1.51e14,
    effects: [
      {
        value: 2,
        targets: [Target["Alchemy Lab"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Alchemy Lab"], amount: 100 }],
  },
} as const satisfies Record<AlchemyLabUpgradeId, Except<Upgrade<AlchemyLabUpgradeId>, "id">>;

export const AlchemyLabUpgrades: ReadonlySet<(typeof AlchemyLabUpgradeMap)[keyof typeof AlchemyLabUpgradeMap]> = new Set(
  Object.values(AlchemyLabUpgradeMap),
);
