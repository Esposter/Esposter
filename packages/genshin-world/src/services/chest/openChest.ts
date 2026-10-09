import type { ChestPlace } from "#src/models/chest/ChestPlace";
import type { ChestRange } from "#src/models/chest/ChestRange";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { ChestKindRewardMap } from "#src/services/chest/ChestKindRewardMap";

// Opening a chest once: its Primogems and Mora roll within their ranges into the wallet and the chest is kept as opened.
// A chest already opened, or of a kind with no reward yet, is left as it is, so it stays openable. The random number is
// Supplied by the caller, so the roll is seeded wherever its caller is
export const openChest = (
  { id, kind }: ChestPlace,
  openedChestIds: ReadonlySet<string>,
  wallet: Wallet,
  random: () => number,
): { openedChestIds: ReadonlySet<string>; wallet: Wallet } => {
  const reward = ChestKindRewardMap[kind];
  if (!reward || openedChestIds.has(id)) return { openedChestIds, wallet };
  const drawCount = ({ max, min }: ChestRange) => min + Math.floor(random() * (max - min + 1));
  return {
    openedChestIds: new Set([...openedChestIds, id]),
    wallet: {
      ...wallet,
      [Currency.Mora]: wallet[Currency.Mora] + drawCount(reward.mora),
      [Currency.Primogem]: wallet[Currency.Primogem] + drawCount(reward.primogem),
    },
  };
};
