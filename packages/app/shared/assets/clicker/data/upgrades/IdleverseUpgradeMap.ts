/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { IdleverseUpgradeId } from "#shared/models/clicker/data/upgrade/IdleverseUpgradeId";
import { pluralize } from "#shared/util/text/pluralize";

export const IdleverseUpgradeMap = {
  [IdleverseUpgradeId["Manifest Destiny"]]: {
    description: `${pluralize(Target.Idleverse)} are **twice** as efficient.`,
    flavorDescription: "Also known as: universal imperialism.",
    price: 2.66e23,
    effects: [
      {
        value: 2,
        targets: [Target.Idleverse],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Idleverse, amount: 1 }],
  },
  [IdleverseUpgradeId["The Multiverse in a Nutshell"]]: {
    description: `${pluralize(Target.Idleverse)} are **twice** as efficient.`,
    flavorDescription: "A primer on the modern understanding of parallel universes.",
    price: 9.42e23,
    effects: [
      {
        value: 2,
        targets: [Target.Idleverse],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Idleverse, amount: 5 }],
  },
  [IdleverseUpgradeId["All-conversion"]]: {
    description: `${pluralize(Target.Idleverse)} are **twice** as efficient.`,
    flavorDescription: "Whatever theirs make, ours can use.",
    price: 5.09e24,
    effects: [
      {
        value: 2,
        targets: [Target.Idleverse],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Idleverse, amount: 25 }],
  },
  [IdleverseUpgradeId["Multiverse Agents"]]: {
    description: `${pluralize(Target.Idleverse)} are **twice** as efficient.`,
    flavorDescription: "Our infiltrated liaisons in the other idleverses.",
    price: 1.1e25,
    effects: [
      {
        value: 2,
        targets: [Target.Idleverse],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Idleverse, amount: 50 }],
  },
  [IdleverseUpgradeId["Escape Plan"]]: {
    description: `${pluralize(Target.Idleverse)} are **twice** as efficient.`,
    flavorDescription: "In case this universe doesn't pan out.",
    price: 2.42e25,
    effects: [
      {
        value: 2,
        targets: [Target.Idleverse],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Idleverse, amount: 100 }],
  },
} as const satisfies Record<IdleverseUpgradeId, Except<Upgrade<IdleverseUpgradeId>, "id">>;

export const IdleverseUpgrades: ReadonlySet<(typeof IdleverseUpgradeMap)[keyof typeof IdleverseUpgradeMap]> = new Set(
  Object.values(IdleverseUpgradeMap),
);
