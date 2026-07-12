/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { WizardTowerUpgradeId } from "#shared/models/clicker/data/upgrade/WizardTowerUpgradeId";
import { pluralize } from "#shared/util/text/pluralize";

export const WizardTowerUpgradeMap = {
  [WizardTowerUpgradeId["Pointier Hats"]]: {
    description: `${pluralize(Target["Wizard Tower"])} are **twice** as efficient.`,
    flavorDescription: "Tests have shown increased magical performance.",
    price: 7.32e9,
    effects: [
      {
        value: 2,
        targets: [Target["Wizard Tower"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Wizard Tower"], amount: 1 }],
  },
  [WizardTowerUpgradeId["Beardlier Beards"]]: {
    description: `${pluralize(Target["Wizard Tower"])} are **twice** as efficient.`,
    flavorDescription: "The wizard is in the beard.",
    price: 2.59e10,
    effects: [
      {
        value: 2,
        targets: [Target["Wizard Tower"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Wizard Tower"], amount: 5 }],
  },
  [WizardTowerUpgradeId["Ancient Grimoires"]]: {
    description: `${pluralize(Target["Wizard Tower"])} are **twice** as efficient.`,
    flavorDescription: "Contain interesting spells, and delicious recipes.",
    price: 1.4e11,
    effects: [
      {
        value: 2,
        targets: [Target["Wizard Tower"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Wizard Tower"], amount: 25 }],
  },
  [WizardTowerUpgradeId["Kitchen Curses"]]: {
    description: `${pluralize(Target["Wizard Tower"])} are **twice** as efficient.`,
    flavorDescription: "Never burn a batch again.",
    price: 3.04e11,
    effects: [
      {
        value: 2,
        targets: [Target["Wizard Tower"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Wizard Tower"], amount: 50 }],
  },
  [WizardTowerUpgradeId["School of Sorcery"]]: {
    description: `${pluralize(Target["Wizard Tower"])} are **twice** as efficient.`,
    flavorDescription: "Now enrolling; bring your own newt.",
    price: 6.66e11,
    effects: [
      {
        value: 2,
        targets: [Target["Wizard Tower"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Wizard Tower"], amount: 100 }],
  },
} as const satisfies Record<WizardTowerUpgradeId, Except<Upgrade<WizardTowerUpgradeId>, "id">>;

export const WizardTowerUpgrades: ReadonlySet<(typeof WizardTowerUpgradeMap)[keyof typeof WizardTowerUpgradeMap]> =
  new Set(Object.values(WizardTowerUpgradeMap));
