import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { ChestKindRewardMap } from "#src/services/chest/ChestKindRewardMap";
import { drawChestCount } from "#src/services/chest/drawChestCount";
import { rollChestDrops } from "#src/services/chest/rollChestDrops";

// Opening a chest once: its Primogems and Mora roll within their ranges into the wallet, what it pours out is rolled from
// Its pool, and the chest is kept as opened. A chest already opened, or of a kind with no reward yet, is left as it is, so
// It stays openable. The random number is supplied by the caller, so the roll is seeded wherever its caller is
export const openChest = (
  { id, kind }: ChestPlace,
  openedChestIds: ReadonlySet<string>,
  wallet: Wallet,
  random: () => number,
): { drops: DroppedItem[]; openedChestIds: ReadonlySet<string>; wallet: Wallet } => {
  const reward = ChestKindRewardMap[kind];
  if (!reward || openedChestIds.has(id)) return { drops: [], openedChestIds, wallet };
  const moraCount = drawChestCount(reward.mora, random);
  const primogemCount = drawChestCount(reward.primogem, random);
  return {
    drops: rollChestDrops(kind, random),
    openedChestIds: new Set([...openedChestIds, id]),
    wallet: {
      ...wallet,
      [Currency.Mora]: wallet[Currency.Mora] + moraCount,
      [Currency.Primogem]: wallet[Currency.Primogem] + primogemCount,
    },
  };
};
