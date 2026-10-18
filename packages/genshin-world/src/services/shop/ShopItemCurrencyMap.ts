import { Currency } from "#src/models/inventory/Currency";

// The items a shop trades in as currencies, by their ids in the game's tables: Mora, which the general goods are priced
// In, Masterless Starglitter and Stardust, which the shop takes, the two Fates it gives, and Realm Currency, which the Realm
// Depot prices its goods in. The ids are read from the Table; the pairing of the Masterless two is settled on the shop
// Page's Decisions and awaits a recording's check of their names
export const ShopItemCurrencyMap: Partial<Record<number, Currency>> = {
  202: Currency.Mora,
  204: Currency.RealmCurrency,
  221: Currency.MasterlessStarglitter,
  222: Currency.MasterlessStardust,
  223: Currency.IntertwinedFate,
  224: Currency.AcquaintFate,
};
