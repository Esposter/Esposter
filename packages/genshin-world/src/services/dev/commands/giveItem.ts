import type { DevSaveOutcome } from "#src/models/dev/DevSaveOutcome";
import type { DevSaveTables } from "#src/models/dev/DevSaveTables";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import { MAX_DEV_GIVE_COUNT } from "#src/services/dev/constants";
import { resolveDevItem } from "#src/services/dev/resolveDevItem";
import { addRewardItem } from "#src/services/inventory/addRewardItem";
import { toInventory } from "#src/services/save/toInventory";
import { toInventorySave } from "#src/services/save/toInventorySave";
import { toWallet } from "#src/services/save/toWallet";
import { toWalletSave } from "#src/services/save/toWalletSave";
import { z } from "zod";

// The `give` line: an item by the name the game shows it under, and how many of it, one when the line gives no count. Its
// Words are read item first, in the order the command's `argumentNames` lists them
export const giveItemArgs = z.object({
  count: z.coerce.number().int().min(1).max(MAX_DEV_GIVE_COUNT).default(1),
  item: z.string().min(1),
});

export type GiveItemArguments = z.infer<typeof giveItemArgs>;

// Gives an item the way the game's reward act gives one: a wallet currency into the wallet, any other item into the bag.
// The bag refuses the whole of an item when it cannot take all of it.
// The names are the ones the bag and its screens show
export const giveItem = (
  save: GenshinSave,
  { count, item }: GiveItemArguments,
  tables: Pick<DevSaveTables, "gameText" | "materialDataMap" | "nameText" | "reliquaryPieceEntryMap" | "weaponDataMap">,
): DevSaveOutcome => {
  const resolution = resolveDevItem(item, tables);
  if (!resolution.ok) return resolution;

  const { id, name } = resolution.entry;
  const inventory = toInventory(
    save.inventory,
    tables.nameText,
    tables.weaponDataMap,
    tables.materialDataMap,
    tables.reliquaryPieceEntryMap,
  );
  const reward = addRewardItem(
    { inventory, wallet: toWallet(save.wallet) },
    { count, id },
    tables.nameText,
    tables.materialDataMap,
  );
  if (!reward) return { error: `the bag cannot take ${count} ${name} whole`, ok: false };

  return {
    ok: true,
    save: { ...save, inventory: toInventorySave(reward.inventory), wallet: toWalletSave(reward.wallet) },
    value: count,
  };
};
