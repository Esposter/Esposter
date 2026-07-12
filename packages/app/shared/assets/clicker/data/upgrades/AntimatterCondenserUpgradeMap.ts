/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { AntimatterCondenserUpgradeId } from "#shared/models/clicker/data/upgrade/AntimatterCondenserUpgradeId";
import { plural } from "pluralize";

export const AntimatterCondenserUpgradeMap = {
  [AntimatterCondenserUpgradeId["Sugar Bosons"]]: {
    description: `${plural(Target["Antimatter Condenser"])} are **twice** as efficient.`,
    flavorDescription: "Sweet forces bind the universe.",
    price: 3.77e15,
    effects: [
      {
        value: 2,
        targets: [Target["Antimatter Condenser"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Antimatter Condenser"], amount: 1 }],
  },
  [AntimatterCondenserUpgradeId["String Theory"]]: {
    description: `${plural(Target["Antimatter Condenser"])} are **twice** as efficient.`,
    flavorDescription: "It's all held together with strings.",
    price: 1.33e16,
    effects: [
      {
        value: 2,
        targets: [Target["Antimatter Condenser"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Antimatter Condenser"], amount: 5 }],
  },
  [AntimatterCondenserUpgradeId["Large Macaron Collider"]]: {
    description: `${plural(Target["Antimatter Condenser"])} are **twice** as efficient.`,
    flavorDescription: "Take that, Geneva.",
    price: 7.21e16,
    effects: [
      {
        value: 2,
        targets: [Target["Antimatter Condenser"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Antimatter Condenser"], amount: 25 }],
  },
  [AntimatterCondenserUpgradeId["Big Bang Bake"]]: {
    description: `${plural(Target["Antimatter Condenser"])} are **twice** as efficient.`,
    flavorDescription: "And that's how it all began.",
    price: 1.56e17,
    effects: [
      {
        value: 2,
        targets: [Target["Antimatter Condenser"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Antimatter Condenser"], amount: 50 }],
  },
  [AntimatterCondenserUpgradeId["Reverse Cyclotrons"]]: {
    description: `${plural(Target["Antimatter Condenser"])} are **twice** as efficient.`,
    flavorDescription: "These can uncollide particles.",
    price: 3.43e17,
    effects: [
      {
        value: 2,
        targets: [Target["Antimatter Condenser"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Antimatter Condenser"], amount: 100 }],
  },
} as const satisfies Record<AntimatterCondenserUpgradeId, Except<Upgrade<AntimatterCondenserUpgradeId>, "id">>;

export const AntimatterCondenserUpgrades: ReadonlySet<(typeof AntimatterCondenserUpgradeMap)[keyof typeof AntimatterCondenserUpgradeMap]> = new Set(
  Object.values(AntimatterCondenserUpgradeMap),
);
