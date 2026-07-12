/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { BankUpgradeId } from "#shared/models/clicker/data/upgrade/BankUpgradeId";
import { pluralize } from "#shared/util/text/pluralize";

export const BankUpgradeMap = {
  [BankUpgradeId["Taller Tellers"]]: {
    description: `${pluralize(Target.Bank)} are **twice** as efficient.`,
    flavorDescription: "Able to see over the counter, and everything.",
    price: 3.11e7,
    effects: [
      {
        value: 2,
        targets: [Target.Bank],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Bank, amount: 1 }],
  },
  [BankUpgradeId["Scissor-resistant Credit Cards"]]: {
    description: `${pluralize(Target.Bank)} are **twice** as efficient.`,
    flavorDescription: "Snip snip snip. Ha, no.",
    price: 1.1e8,
    effects: [
      {
        value: 2,
        targets: [Target.Bank],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Bank, amount: 5 }],
  },
  [BankUpgradeId["Acid-proof Vaults"]]: {
    description: `${pluralize(Target.Bank)} are **twice** as efficient.`,
    flavorDescription: "You know what they say: better safe than sorry.",
    price: 5.93e8,
    effects: [
      {
        value: 2,
        targets: [Target.Bank],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Bank, amount: 25 }],
  },
  [BankUpgradeId["Chocolate Coins"]]: {
    description: `${pluralize(Target.Bank)} are **twice** as efficient.`,
    flavorDescription: "This revolutionary currency is much easier to melt down.",
    price: 1.29e9,
    effects: [
      {
        value: 2,
        targets: [Target.Bank],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Bank, amount: 50 }],
  },
  [BankUpgradeId["Exponential Interest Rates"]]: {
    description: `${pluralize(Target.Bank)} are **twice** as efficient.`,
    flavorDescription: "Can't argue with math.",
    price: 2.83e9,
    effects: [
      {
        value: 2,
        targets: [Target.Bank],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Bank, amount: 100 }],
  },
} as const satisfies Record<BankUpgradeId, Except<Upgrade<BankUpgradeId>, "id">>;

export const BankUpgrades: ReadonlySet<(typeof BankUpgradeMap)[keyof typeof BankUpgradeMap]> = new Set(
  Object.values(BankUpgradeMap),
);
