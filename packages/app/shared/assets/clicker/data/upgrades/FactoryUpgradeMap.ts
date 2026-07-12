/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { FactoryUpgradeId } from "#shared/models/clicker/data/upgrade/FactoryUpgradeId";
import { pluralize } from "#shared/util/text/pluralize";

export const FactoryUpgradeMap = {
  [FactoryUpgradeId["Sturdier Conveyor Belts"]]: {
    description: `${pluralize(Target.Factory)} are **twice** as efficient.`,
    flavorDescription: "They just keep rolling.",
    price: 2.88e6,
    effects: [
      {
        value: 2,
        targets: [Target.Factory],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Factory, amount: 1 }],
  },
  [FactoryUpgradeId["Assembly Line Optimization"]]: {
    description: `${pluralize(Target.Factory)} are **twice** as efficient.`,
    flavorDescription: "Every second counts.",
    price: 1.02e7,
    effects: [
      {
        value: 2,
        targets: [Target.Factory],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Factory, amount: 5 }],
  },
  [FactoryUpgradeId.Sweatshop]: {
    description: `${pluralize(Target.Factory)} are **twice** as efficient.`,
    flavorDescription: "Slackers will be terminated.",
    price: 5.51e7,
    effects: [
      {
        value: 2,
        targets: [Target.Factory],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Factory, amount: 25 }],
  },
  [FactoryUpgradeId["Radium Reactors"]]: {
    description: `${pluralize(Target.Factory)} are **twice** as efficient.`,
    flavorDescription: "Gives your products a healthy glow.",
    price: 1.2e8,
    effects: [
      {
        value: 2,
        targets: [Target.Factory],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Factory, amount: 50 }],
  },
  [FactoryUpgradeId.Recombobulators]: {
    description: `${pluralize(Target.Factory)} are **twice** as efficient.`,
    flavorDescription: "A major part of the assembly process.",
    price: 2.62e8,
    effects: [
      {
        value: 2,
        targets: [Target.Factory],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Factory, amount: 100 }],
  },
} as const satisfies Record<FactoryUpgradeId, Except<Upgrade<FactoryUpgradeId>, "id">>;

export const FactoryUpgrades: ReadonlySet<(typeof FactoryUpgradeMap)[keyof typeof FactoryUpgradeMap]> = new Set(
  Object.values(FactoryUpgradeMap),
);
