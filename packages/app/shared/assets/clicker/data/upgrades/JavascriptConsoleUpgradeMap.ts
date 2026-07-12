/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { JavascriptConsoleUpgradeId } from "#shared/models/clicker/data/upgrade/JavascriptConsoleUpgradeId";
import { plural } from "pluralize";

export const JavascriptConsoleUpgradeMap = {
  [JavascriptConsoleUpgradeId.Emscripten]: {
    description: `${plural(Target["Javascript Console"])} are **twice** as efficient.`,
    flavorDescription: "Everything compiles to JavaScript if you try hard enough.",
    price: 1.58e21,
    effects: [
      {
        value: 2,
        targets: [Target["Javascript Console"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Javascript Console"], amount: 1 }],
  },
  [JavascriptConsoleUpgradeId["64bit Arrays"]]: {
    description: `${plural(Target["Javascript Console"])} are **twice** as efficient.`,
    flavorDescription: "A bit of a hack, but it doubles the world's storage capacity.",
    price: 5.57e21,
    effects: [
      {
        value: 2,
        targets: [Target["Javascript Console"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Javascript Console"], amount: 5 }],
  },
  [JavascriptConsoleUpgradeId["Stack Overflow"]]: {
    description: `${plural(Target["Javascript Console"])} are **twice** as efficient.`,
    flavorDescription: "The answer was there all along.",
    price: 3.01e22,
    effects: [
      {
        value: 2,
        targets: [Target["Javascript Console"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Javascript Console"], amount: 25 }],
  },
  [JavascriptConsoleUpgradeId["Enterprise Compiler"]]: {
    description: `${plural(Target["Javascript Console"])} are **twice** as efficient.`,
    flavorDescription: "This baby can turn any code into a working product.",
    price: 6.53e22,
    effects: [
      {
        value: 2,
        targets: [Target["Javascript Console"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Javascript Console"], amount: 50 }],
  },
  [JavascriptConsoleUpgradeId["Syntactic Sugar"]]: {
    description: `${plural(Target["Javascript Console"])} are **twice** as efficient.`,
    flavorDescription: "Just a spoonful makes the code go down.",
    price: 1.43e23,
    effects: [
      {
        value: 2,
        targets: [Target["Javascript Console"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Javascript Console"], amount: 100 }],
  },
} as const satisfies Record<JavascriptConsoleUpgradeId, Except<Upgrade<JavascriptConsoleUpgradeId>, "id">>;

export const JavascriptConsoleUpgrades: ReadonlySet<(typeof JavascriptConsoleUpgradeMap)[keyof typeof JavascriptConsoleUpgradeMap]> = new Set(
  Object.values(JavascriptConsoleUpgradeMap),
);
