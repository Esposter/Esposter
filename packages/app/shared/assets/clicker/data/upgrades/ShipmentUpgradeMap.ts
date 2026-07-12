/* eslint-disable perfectionist/sort-objects */
import type { Upgrade } from "#shared/models/clicker/data/upgrade/Upgrade";
import type { Except } from "type-fest";

import { EffectType } from "#shared/models/clicker/data/effect/EffectType";
import { Target } from "#shared/models/clicker/data/Target";
import { ShipmentUpgradeId } from "#shared/models/clicker/data/upgrade/ShipmentUpgradeId";
import { pluralize } from "#shared/util/text/pluralize";

export const ShipmentUpgradeMap = {
  [ShipmentUpgradeId["Vanilla Nebulae"]]: {
    description: `${pluralize(Target.Shipment)} are **twice** as efficient.`,
    flavorDescription: "Only massive amounts of vanilla can flavor deep space.",
    price: 1.13e11,
    effects: [
      {
        value: 2,
        targets: [Target.Shipment],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Shipment, amount: 1 }],
  },
  [ShipmentUpgradeId.Wormholes]: {
    description: `${pluralize(Target.Shipment)} are **twice** as efficient.`,
    flavorDescription: "Take the shortcut.",
    price: 4e11,
    effects: [
      {
        value: 2,
        targets: [Target.Shipment],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Shipment, amount: 5 }],
  },
  [ShipmentUpgradeId["Frequent Flyer"]]: {
    description: `${pluralize(Target.Shipment)} are **twice** as efficient.`,
    flavorDescription: "Come back soon!",
    price: 2.16e12,
    effects: [
      {
        value: 2,
        targets: [Target.Shipment],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Shipment, amount: 25 }],
  },
  [ShipmentUpgradeId["Warp Drive"]]: {
    description: `${pluralize(Target.Shipment)} are **twice** as efficient.`,
    flavorDescription: "To boldly bake.",
    price: 4.69e12,
    effects: [
      {
        value: 2,
        targets: [Target.Shipment],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Shipment, amount: 50 }],
  },
  [ShipmentUpgradeId["Chocolate Monoliths"]]: {
    description: `${pluralize(Target.Shipment)} are **twice** as efficient.`,
    flavorDescription: "My god. It's full of chocolate bars.",
    price: 1.03e13,
    effects: [
      {
        value: 2,
        targets: [Target.Shipment],
        configuration: {
          type: EffectType.Multiplicative,
        },
      },
    ],
    unlockConditions: [{ type: Target.Building, id: Target.Shipment, amount: 100 }],
  },
} as const satisfies Record<ShipmentUpgradeId, Except<Upgrade<ShipmentUpgradeId>, "id">>;

export const ShipmentUpgrades: ReadonlySet<(typeof ShipmentUpgradeMap)[keyof typeof ShipmentUpgradeMap]> = new Set(
  Object.values(ShipmentUpgradeMap),
);
