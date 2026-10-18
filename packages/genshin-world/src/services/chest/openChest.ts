import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { ChestKindRewardMap } from "#src/services/chest/ChestKindRewardMap";
import { drawChestCount } from "#src/services/chest/drawChestCount";
import { rollChestDrops } from "#src/services/chest/rollChestDrops";

// Opening a chest once: its Primogems, Mora and Sigils roll within their ranges into the wallet, the Sigils being the
// Region's own, `sigilCurrency`, its Adventure EXP is paid to the Adventure Rank, and what it holds is rolled from its
// Pool and kept apart by where it stands: poured out where the chest stands, or sent straight to the bag where a drop
// Would fall away there. The chest is kept as opened. A chest already opened, or of a kind with no reward yet, is left
// As it is, so it stays openable. The random number is supplied by the caller, so the roll is seeded wherever its caller
// Is
export const openChest = (
  { id, kind }: ChestPlace,
  openedChestIds: ReadonlySet<string>,
  wallet: Wallet,
  random: () => number,
  sigilCurrency: Currency,
  isDropFallingAway: boolean,
): {
  adventureExp: number;
  bagDrops: DroppedItem[];
  drops: DroppedItem[];
  openedChestIds: ReadonlySet<string>;
  wallet: Wallet;
} => {
  const reward = ChestKindRewardMap[kind];
  if (!reward || openedChestIds.has(id)) return { adventureExp: 0, bagDrops: [], drops: [], openedChestIds, wallet };
  const moraCount = drawChestCount(reward.mora, random);
  const primogemCount = drawChestCount(reward.primogem, random);
  const sigilCount = drawChestCount(reward.sigil, random);
  const chestDrops = rollChestDrops(kind, random);
  return {
    adventureExp: reward.adventureExp,
    bagDrops: isDropFallingAway ? chestDrops : [],
    drops: isDropFallingAway ? [] : chestDrops,
    openedChestIds: new Set([...openedChestIds, id]),
    wallet: {
      ...wallet,
      [Currency.Mora]: wallet[Currency.Mora] + moraCount,
      [Currency.Primogem]: wallet[Currency.Primogem] + primogemCount,
      [sigilCurrency]: wallet[sigilCurrency] + sigilCount,
    },
  };
};
