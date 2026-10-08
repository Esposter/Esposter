import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { ORIGINAL_RESIN_CAP } from "#src/services/originalResin/constants";
import { ItemCategory } from "genshin-interface";

// The tabs whose every weapon or artifact is an entry of its own, never stacked, sorted by level or quality as chosen
export const EQUIPMENT_CATEGORIES: readonly ItemCategory[] = [ItemCategory.Weapon, ItemCategory.Artifact];
// The tabs the game sorts from the highest quality down
export const QUALITY_SORTED_CATEGORIES: readonly ItemCategory[] = [ItemCategory.Gadget, ItemCategory.Quest];
// How many kinds of item the bag holds beside the weapons, artifacts and furnishings it counts on their own
export const INVENTORY_KIND_LIMIT = 2300;
// A new weapon is at level 1 and a new artifact at 0
export const WEAPON_START_LEVEL = 1;
export const ARTIFACT_START_LEVEL = 0;
// The currencies the foot of the bag shows where the sort is not, and those it files among its Precious Items, in the game's order
export const INVENTORY_CURRENCIES: readonly Currency[] = [Currency.Primogem, Currency.Mora];
export const PRECIOUS_CURRENCIES: readonly Currency[] = [
  Currency.MasterlessStarglitter,
  Currency.MasterlessStardust,
  Currency.IntertwinedFate,
  Currency.AcquaintFate,
];
// A new player's bag holds nothing, and their wallet nothing but Original Resin at its regeneration cap, from the epoch
export const EMPTY_INVENTORY: Readonly<Inventory> = { items: [], nextId: 0 };
export const EMPTY_WALLET: Readonly<Wallet> = {
  [Currency.AcquaintFate]: 0,
  [Currency.GenesisCrystal]: 0,
  [Currency.IntertwinedFate]: 0,
  [Currency.MasterlessStardust]: 0,
  [Currency.MasterlessStarglitter]: 0,
  [Currency.Mora]: 0,
  [Currency.OriginalResin]: ORIGINAL_RESIN_CAP,
  [Currency.Primogem]: 0,
  originalResinChangedAt: Temporal.Instant.fromEpochMilliseconds(0),
  primogemResinRefillCount: 0,
  primogemResinRefillDay: Temporal.PlainDate.from("1970-01-01"),
};
// Mora's item id in the game's tables, which every pile of it a defeated enemy drops is filed under
export const MORA_ITEM_ID = 202;
