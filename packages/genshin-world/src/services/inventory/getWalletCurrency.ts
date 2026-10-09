import { Currency } from "#src/models/inventory/Currency";
import { CurrencyItemIdMap } from "#src/services/inventory/constants";

// The wallet's currency an item id is filed under in the game's table, or undefined for an item the bag holds
export const getWalletCurrency = (itemId: number): Currency | undefined =>
  Object.values(Currency).find((currency) => CurrencyItemIdMap[currency] === itemId);
