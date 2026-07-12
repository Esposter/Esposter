/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { FractalEngineUpgradeId } from "#shared/models/clicker/data/upgrade/FractalEngineUpgradeId";
import { pluralize } from "#shared/util/text/pluralize";

export const FractalEngineUpgradeMap = {
  [FractalEngineUpgradeId.Metabakeries]: {
    description: `${pluralize(Target["Fractal Engine"])} are **twice** as efficient.`,
    flavorDescription: "They practically bake themselves.",
    price: 6.88e18,
    effects: [
      {
        value: 2,
        targets: [Target["Fractal Engine"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Fractal Engine"], amount: 1 }],
  },
  [FractalEngineUpgradeId["Mandelbrown Sugar"]]: {
    description: `${pluralize(Target["Fractal Engine"])} are **twice** as efficient.`,
    flavorDescription: "A substance that displays useful properties such as fractal sweetness.",
    price: 2.43e19,
    effects: [
      {
        value: 2,
        targets: [Target["Fractal Engine"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Fractal Engine"], amount: 5 }],
  },
  [FractalEngineUpgradeId.Fractoids]: {
    description: `${pluralize(Target["Fractal Engine"])} are **twice** as efficient.`,
    flavorDescription: "Here's a fun fract: they're deliciously fractal.",
    price: 1.31e20,
    effects: [
      {
        value: 2,
        targets: [Target["Fractal Engine"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Fractal Engine"], amount: 25 }],
  },
  [FractalEngineUpgradeId["Nested Universe Theory"]]: {
    description: `${pluralize(Target["Fractal Engine"])} are **twice** as efficient.`,
    flavorDescription: "What if we're all in a simulation inside a simulation?",
    price: 2.85e20,
    effects: [
      {
        value: 2,
        targets: [Target["Fractal Engine"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Fractal Engine"], amount: 50 }],
  },
  [FractalEngineUpgradeId["Menger Sponge Cake"]]: {
    description: `${pluralize(Target["Fractal Engine"])} are **twice** as efficient.`,
    flavorDescription: "Frighteningly absorbent, infinitely so.",
    price: 6.26e20,
    effects: [
      {
        value: 2,
        targets: [Target["Fractal Engine"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Fractal Engine"], amount: 100 }],
  },
} as const satisfies Record<FractalEngineUpgradeId, Except<Upgrade<FractalEngineUpgradeId>, "id">>;

export const FractalEngineUpgrades: ReadonlySet<
  (typeof FractalEngineUpgradeMap)[keyof typeof FractalEngineUpgradeMap]
> = new Set(Object.values(FractalEngineUpgradeMap));
