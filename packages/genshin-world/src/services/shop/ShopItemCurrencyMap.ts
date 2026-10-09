import { Currency } from "#src/models/inventory/Currency";

// The items a shop trades in as currencies, by their ids in the game's tables: Masterless Starglitter and Stardust, which
// The shop takes, and the two Fates it gives. The ids are read from the table; the pairing of the first two is settled
// On the shop page's Decisions and awaits a recording's check of their names
export const ShopItemCurrencyMap: Partial<Record<number, Currency>> = {
  221: Currency.MasterlessStarglitter,
  222: Currency.MasterlessStardust,
  223: Currency.IntertwinedFate,
  224: Currency.AcquaintFate,
};
