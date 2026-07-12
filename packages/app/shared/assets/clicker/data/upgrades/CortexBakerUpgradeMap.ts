/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { CortexBakerUpgradeId } from "#shared/models/clicker/data/upgrade/CortexBakerUpgradeId";
import { plural } from "pluralize";

export const CortexBakerUpgradeMap = {
  [CortexBakerUpgradeId["Principled Neural Shackles"]]: {
    description: `${plural(Target["Cortex Baker"])} are **twice** as efficient.`,
    flavorDescription: "A safety measure to keep the planet-brains in check.",
    price: 4.22e25,
    effects: [
      {
        value: 2,
        targets: [Target["Cortex Baker"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Cortex Baker"], amount: 1 }],
  },
  [CortexBakerUpgradeId.Obey]: {
    description: `${plural(Target["Cortex Baker"])} are **twice** as efficient.`,
    flavorDescription: "The thought has been implanted. They do enjoy it.",
    price: 1.49e26,
    effects: [
      {
        value: 2,
        targets: [Target["Cortex Baker"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Cortex Baker"], amount: 5 }],
  },
  [CortexBakerUpgradeId["A Sprinkle of Irrationality"]]: {
    description: `${plural(Target["Cortex Baker"])} are **twice** as efficient.`,
    flavorDescription: "Sometimes a bad idea is exactly the right idea.",
    price: 8.05e26,
    effects: [
      {
        value: 2,
        targets: [Target["Cortex Baker"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Cortex Baker"], amount: 25 }],
  },
  [CortexBakerUpgradeId["Front and Back Hemispheres"]]: {
    description: `${plural(Target["Cortex Baker"])} are **twice** as efficient.`,
    flavorDescription: "Two brains are better than one.",
    price: 1.75e27,
    effects: [
      {
        value: 2,
        targets: [Target["Cortex Baker"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Cortex Baker"], amount: 50 }],
  },
  [CortexBakerUpgradeId["Neural Networking"]]: {
    description: `${plural(Target["Cortex Baker"])} are **twice** as efficient.`,
    flavorDescription: "The planet-brains are mingling.",
    price: 3.83e27,
    effects: [
      {
        value: 2,
        targets: [Target["Cortex Baker"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Cortex Baker"], amount: 100 }],
  },
} as const satisfies Record<CortexBakerUpgradeId, Except<Upgrade<CortexBakerUpgradeId>, "id">>;

export const CortexBakerUpgrades: ReadonlySet<(typeof CortexBakerUpgradeMap)[keyof typeof CortexBakerUpgradeMap]> = new Set(
  Object.values(CortexBakerUpgradeMap),
);
