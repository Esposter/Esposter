/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { PortalUpgradeId } from "#shared/models/clicker/data/upgrade/PortalUpgradeId";
import { pluralize } from "#shared/util/text/pluralize";

export const PortalUpgradeMap = {
  [PortalUpgradeId["Ancient Tablet"]]: {
    description: `${pluralize(Target.Portal)} are **twice** as efficient.`,
    flavorDescription: "A strange slab of stone covered in cryptic runes.",
    price: 2.22e13,
    effects: [
      {
        value: 2,
        targets: [Target.Portal],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Portal, amount: 1 }],
  },
  [PortalUpgradeId["Insane Oatling Workers"]]: {
    description: `${pluralize(Target.Portal)} are **twice** as efficient.`,
    flavorDescription: "They do their job well, considering they have no bones.",
    price: 7.85e13,
    effects: [
      {
        value: 2,
        targets: [Target.Portal],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Portal, amount: 5 }],
  },
  [PortalUpgradeId["Soul Bond"]]: {
    description: `${pluralize(Target.Portal)} are **twice** as efficient.`,
    flavorDescription: "So I just sign here and... what could go wrong?",
    price: 4.24e14,
    effects: [
      {
        value: 2,
        targets: [Target.Portal],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Portal, amount: 25 }],
  },
  [PortalUpgradeId["Sanity Dance"]]: {
    description: `${pluralize(Target.Portal)} are **twice** as efficient.`,
    flavorDescription: "The mind cannot be broken if it moves with the beat.",
    price: 9.2e14,
    effects: [
      {
        value: 2,
        targets: [Target.Portal],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Portal, amount: 50 }],
  },
  [PortalUpgradeId["Brane Transplant"]]: {
    description: `${pluralize(Target.Portal)} are **twice** as efficient.`,
    flavorDescription: "This is going to hurt a little bit.",
    price: 2.02e15,
    effects: [
      {
        value: 2,
        targets: [Target.Portal],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Portal, amount: 100 }],
  },
} as const satisfies Record<PortalUpgradeId, Except<Upgrade<PortalUpgradeId>, "id">>;

export const PortalUpgrades: ReadonlySet<(typeof PortalUpgradeMap)[keyof typeof PortalUpgradeMap]> = new Set(
  Object.values(PortalUpgradeMap),
);
