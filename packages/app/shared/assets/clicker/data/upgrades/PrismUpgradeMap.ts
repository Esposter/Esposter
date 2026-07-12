/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { PrismUpgradeId } from "#shared/models/clicker/data/upgrade/PrismUpgradeId";
import { pluralize } from "#shared/util/text/pluralize";

export const PrismUpgradeMap = {
  [PrismUpgradeId["Gem Polish"]]: {
    description: `${pluralize(Target.Prism)} are **twice** as efficient.`,
    flavorDescription: "Get rid of dust for a truer shine.",
    price: 4.66e16,
    effects: [
      {
        value: 2,
        targets: [Target.Prism],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Prism, amount: 1 }],
  },
  [PrismUpgradeId["9th Color"]]: {
    description: `${pluralize(Target.Prism)} are **twice** as efficient.`,
    flavorDescription: "Delicious.",
    price: 1.65e17,
    effects: [
      {
        value: 2,
        targets: [Target.Prism],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Prism, amount: 5 }],
  },
  [PrismUpgradeId["Chocolate Light"]]: {
    description: `${pluralize(Target.Prism)} are **twice** as efficient.`,
    flavorDescription: "Bathe in it.",
    price: 8.9e17,
    effects: [
      {
        value: 2,
        targets: [Target.Prism],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Prism, amount: 25 }],
  },
  [PrismUpgradeId.Grainbow]: {
    description: `${pluralize(Target.Prism)} are **twice** as efficient.`,
    flavorDescription: "Remarkable, and also delicious.",
    price: 1.93e18,
    effects: [
      {
        value: 2,
        targets: [Target.Prism],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Prism, amount: 50 }],
  },
  [PrismUpgradeId["Pure Cosmic Light"]]: {
    description: `${pluralize(Target.Prism)} are **twice** as efficient.`,
    flavorDescription: "Everything is turning white.",
    price: 4.24e18,
    effects: [
      {
        value: 2,
        targets: [Target.Prism],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Prism, amount: 100 }],
  },
} as const satisfies Record<PrismUpgradeId, Except<Upgrade<PrismUpgradeId>, "id">>;

export const PrismUpgrades: ReadonlySet<(typeof PrismUpgradeMap)[keyof typeof PrismUpgradeMap]> = new Set(
  Object.values(PrismUpgradeMap),
);
