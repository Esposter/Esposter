/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { ChancemakerUpgradeId } from "#shared/models/clicker/data/upgrade/ChancemakerUpgradeId";
import { plural } from "pluralize";

export const ChancemakerUpgradeMap = {
  [ChancemakerUpgradeId["Lucky Horseshoe"]]: {
    description: `${plural(Target.Chancemaker)} are **twice** as efficient.`,
    flavorDescription: "Someone out there is walking with three shoes.",
    price: 5.77e17,
    effects: [
      {
        value: 2,
        targets: [Target.Chancemaker],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Chancemaker, amount: 1 }],
  },
  [ChancemakerUpgradeId["Lucky Day"]]: {
    description: `${plural(Target.Chancemaker)} are **twice** as efficient.`,
    flavorDescription: "Feels like today's your day.",
    price: 2.04e18,
    effects: [
      {
        value: 2,
        targets: [Target.Chancemaker],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Chancemaker, amount: 5 }],
  },
  [ChancemakerUpgradeId.Serendipity]: {
    description: `${plural(Target.Chancemaker)} are **twice** as efficient.`,
    flavorDescription: "What a happy accident.",
    price: 1.1e19,
    effects: [
      {
        value: 2,
        targets: [Target.Chancemaker],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Chancemaker, amount: 25 }],
  },
  [ChancemakerUpgradeId["Winning Lottery Ticket"]]: {
    description: `${plural(Target.Chancemaker)} are **twice** as efficient.`,
    flavorDescription: "What lottery? THE lottery.",
    price: 2.39e19,
    effects: [
      {
        value: 2,
        targets: [Target.Chancemaker],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Chancemaker, amount: 50 }],
  },
  [ChancemakerUpgradeId["Four-leaf Clover Field"]]: {
    description: `${plural(Target.Chancemaker)} are **twice** as efficient.`,
    flavorDescription: "No giant monsters here, just a whole lot of luck.",
    price: 5.25e19,
    effects: [
      {
        value: 2,
        targets: [Target.Chancemaker],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Chancemaker, amount: 100 }],
  },
} as const satisfies Record<ChancemakerUpgradeId, Except<Upgrade<ChancemakerUpgradeId>, "id">>;

export const ChancemakerUpgrades: ReadonlySet<(typeof ChancemakerUpgradeMap)[keyof typeof ChancemakerUpgradeMap]> = new Set(
  Object.values(ChancemakerUpgradeMap),
);
