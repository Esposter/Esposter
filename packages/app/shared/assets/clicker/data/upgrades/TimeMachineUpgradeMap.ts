/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { TimeMachineUpgradeId } from "#shared/models/clicker/data/upgrade/TimeMachineUpgradeId";
import { pluralize } from "#shared/util/text/pluralize";

export const TimeMachineUpgradeMap = {
  [TimeMachineUpgradeId["Flux Capacitors"]]: {
    description: `${pluralize(Target["Time Machine"])} are **twice** as efficient.`,
    flavorDescription: "Gotta go back in time to buy more.",
    price: 3.11e14,
    effects: [
      {
        value: 2,
        targets: [Target["Time Machine"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Time Machine"], amount: 1 }],
  },
  [TimeMachineUpgradeId["Time Paradox Resolver"]]: {
    description: `${pluralize(Target["Time Machine"])} are **twice** as efficient.`,
    flavorDescription: "What happened, happened. Probably.",
    price: 1.1e15,
    effects: [
      {
        value: 2,
        targets: [Target["Time Machine"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Time Machine"], amount: 5 }],
  },
  [TimeMachineUpgradeId["Quantum Conundrum"]]: {
    description: `${pluralize(Target["Time Machine"])} are **twice** as efficient.`,
    flavorDescription: "It's simple: it both is and isn't.",
    price: 5.93e15,
    effects: [
      {
        value: 2,
        targets: [Target["Time Machine"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Time Machine"], amount: 25 }],
  },
  [TimeMachineUpgradeId["Causality Enforcer"]]: {
    description: `${pluralize(Target["Time Machine"])} are **twice** as efficient.`,
    flavorDescription: "Effects strictly after causes, no exceptions.",
    price: 1.29e16,
    effects: [
      {
        value: 2,
        targets: [Target["Time Machine"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Time Machine"], amount: 50 }],
  },
  [TimeMachineUpgradeId.Yestermorrow]: {
    description: `${pluralize(Target["Time Machine"])} are **twice** as efficient.`,
    flavorDescription: "Sometimes the best time is both.",
    price: 2.83e16,
    effects: [
      {
        value: 2,
        targets: [Target["Time Machine"]],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target["Time Machine"], amount: 100 }],
  },
} as const satisfies Record<TimeMachineUpgradeId, Except<Upgrade<TimeMachineUpgradeId>, "id">>;

export const TimeMachineUpgrades: ReadonlySet<(typeof TimeMachineUpgradeMap)[keyof typeof TimeMachineUpgradeMap]> =
  new Set(Object.values(TimeMachineUpgradeMap));
