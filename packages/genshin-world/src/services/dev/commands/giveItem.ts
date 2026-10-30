import type { DevSaveOutcome } from "#src/models/dev/DevSaveOutcome";
import type { DevSaveTables } from "#src/models/dev/DevSaveTables";
import type { GenshinSave } from "#src/models/save/GenshinSave";

import { Currency } from "#src/models/inventory/Currency";
import { MAX_DEV_GIVE_COUNT } from "#src/services/dev/constants";
import { resolveDevName } from "#src/services/dev/resolveDevName";
import { addRewardItem } from "#src/services/inventory/addRewardItem";
import { CurrencyItemIdMap, WALLET_ITEM_IDS } from "#src/services/inventory/constants";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { getItemName } from "#src/services/inventory/getItemName";
import { toInventory } from "#src/services/save/toInventory";
import { toInventorySave } from "#src/services/save/toInventorySave";
import { toWallet } from "#src/services/save/toWallet";
import { toWalletSave } from "#src/services/save/toWalletSave";
import { z } from "zod";

// The `give` line: an item by the name the game shows it under, and how many of it, one when the line gives no count. A
// Line's words are read against the keys in the order they are written, so the item comes first; the `…Args` name is what
// Keeps `sort-objects` from sorting these keys alphabetically, which would read the count where the item is
export const giveItemArgs = z.object({
  item: z.string().min(1),
  count: z.coerce.number().int().min(1).max(MAX_DEV_GIVE_COUNT).default(1),
});

export type GiveItemArguments = z.infer<typeof giveItemArgs>;

// Gives an item the way the game's reward act gives one: a wallet currency into the wallet, any other item into the bag,
// which refuses the whole of it when the bag cannot take all of it. The names are the ones the bag and its screens show
export const giveItem = (
  save: GenshinSave,
  { count, item }: GiveItemArguments,
  tables: Pick<DevSaveTables, "gameText" | "materialDataMap" | "nameText" | "reliquaryPieceEntryMap" | "weaponDataMap">,
): DevSaveOutcome => {
  const currencyCandidates = Object.values(Currency).map((currency) => ({
    id: CurrencyItemIdMap[currency],
    name: tables.gameText[CurrencyGameTextKeyMap[currency]],
  }));
  const materialCandidates = Array.from(tables.materialDataMap.values())
    .filter(({ id }) => !WALLET_ITEM_IDS.includes(id))
    .map(({ id, nameTextId }) => ({ id, name: getItemName(nameTextId, tables.nameText) }));
  const resolution = resolveDevName([...currencyCandidates, ...materialCandidates], ({ name }) => name, item, "item");
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
