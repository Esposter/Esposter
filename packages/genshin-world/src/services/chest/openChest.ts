import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { ChestKindRewardMap } from "#src/services/chest/ChestKindRewardMap";
import { drawChestCount } from "#src/services/chest/drawChestCount";
import { rollChestDrops } from "#src/services/chest/rollChestDrops";

// Opening a chest once: its Primogems and Mora roll within their ranges into the wallet, its Adventure EXP is paid to
// The Adventure Rank, and what it holds is rolled from its pool and kept apart by where it stands: poured out where the
// Chest stands, or sent straight to the bag where a drop would fall away there. The chest is kept as opened. A chest
// Already opened, or of a kind with no reward yet, is left as it is, so it stays openable. The random number is supplied
// By the caller, so the roll is seeded wherever its caller is
export const openChest = (
  { id, kind }: ChestPlace,
  openedChestIds: ReadonlySet<string>,
  wallet: Wallet,
  random: () => number,
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
    },
  };
};
