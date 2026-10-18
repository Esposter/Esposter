import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";

import { Currency } from "#src/models/inventory/Currency";
import { ORIGINAL_RESIN_ITEM_ID } from "#src/services/crafting/constants";
import { ADVENTURE_EXP_ITEM_ID } from "#src/services/forging/constants";
import { ORIGINAL_RESIN_CAP } from "#src/services/originalResin/constants";
import { ItemCategory } from "genshin-interface";

// The tabs whose every weapon or artifact is an entry of its own, never stacked, sorted by level or quality as chosen
export const EQUIPMENT_CATEGORIES: readonly ItemCategory[] = [ItemCategory.Weapon, ItemCategory.Artifact];
// The tabs the game sorts from the highest quality down
export const QUALITY_SORTED_CATEGORIES: readonly ItemCategory[] = [ItemCategory.Gadget, ItemCategory.Quest];
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
  Currency.MasterlessStellaFortuna,
];
// A new player's bag holds nothing, and their wallet nothing but Original Resin at its regeneration cap, from the epoch
export const EMPTY_INVENTORY: Readonly<Inventory> = { items: [], nextId: 0 };
// A new player's currencies, every one at zero but Original Resin, at its regeneration cap
export const EMPTY_CURRENCIES: Readonly<Record<Currency, number>> = {
  [Currency.AcquaintFate]: 0,
  [Currency.AnemoSigil]: 0,
  [Currency.CryoSigil]: 0,
  [Currency.DendroSigil]: 0,
  [Currency.ElectroSigil]: 0,
  [Currency.GenesisCrystal]: 0,
  [Currency.GeoSigil]: 0,
  [Currency.HydroSigil]: 0,
  [Currency.IntertwinedFate]: 0,
  [Currency.LunaSigil]: 0,
  [Currency.MasterlessStardust]: 0,
  [Currency.MasterlessStarglitter]: 0,
  [Currency.MasterlessStellaFortuna]: 0,
  [Currency.Mora]: 0,
  [Currency.OriginalResin]: ORIGINAL_RESIN_CAP,
  [Currency.Primogem]: 0,
  [Currency.PyroSigil]: 0,
  [Currency.RealmCurrency]: 0,
};
// The eight region Sigils, which a save written before they were added does not hold, so its reader counts them at zero
export const SIGIL_CURRENCIES: readonly Currency[] = [
  Currency.AnemoSigil,
  Currency.CryoSigil,
  Currency.DendroSigil,
  Currency.ElectroSigil,
  Currency.GeoSigil,
  Currency.HydroSigil,
  Currency.LunaSigil,
  Currency.PyroSigil,
];
export const EMPTY_WALLET: Readonly<Wallet> = {
  ...EMPTY_CURRENCIES,
  originalResinChangedAt: Temporal.Instant.fromEpochMilliseconds(0),
  primogemResinRefillCount: 0,
  primogemResinRefillDay: Temporal.PlainDate.from("1970-01-01"),
};
// Mora's item id in the game's tables, which every pile of it a defeated enemy drops is filed under
export const MORA_ITEM_ID = 202;
// Character EXP's item id, which a quest's reward names. It is no bag item and no wallet currency, and no grant pays it yet,
// So it is left out of the items and skipped by a quest's finish
export const CHARACTER_EXP_ITEM_ID = 101;
// The item id each currency the wallet holds is filed under in the game's material table, so a drop or a reward naming
// One is a wallet grant, never a bag item
export const CurrencyItemIdMap: Record<Currency, number> = {
  [Currency.AcquaintFate]: 224,
  [Currency.AnemoSigil]: 305,
  [Currency.CryoSigil]: 306,
  [Currency.DendroSigil]: 303,
  [Currency.ElectroSigil]: 304,
  [Currency.GenesisCrystal]: 203,
  [Currency.GeoSigil]: 307,
  [Currency.HydroSigil]: 302,
  [Currency.IntertwinedFate]: 223,
  [Currency.LunaSigil]: 308,
  [Currency.MasterlessStardust]: 222,
  [Currency.MasterlessStarglitter]: 221,
  [Currency.MasterlessStellaFortuna]: 104_300,
  [Currency.Mora]: MORA_ITEM_ID,
  [Currency.OriginalResin]: ORIGINAL_RESIN_ITEM_ID,
  [Currency.Primogem]: 201,
  [Currency.PyroSigil]: 301,
  [Currency.RealmCurrency]: 204,
};
// Every item id the wallet takes in: each currency's, and Adventure EXP, which the Adventure Rank takes
export const WALLET_ITEM_IDS: readonly number[] = [ADVENTURE_EXP_ITEM_ID, ...Object.values(CurrencyItemIdMap)];
