import type { DevItemTables } from "#src/models/dev/DevItemTables";

import { Currency } from "#src/models/inventory/Currency";
import { resolveDevName } from "#src/services/dev/resolveDevName";
import { CurrencyItemIdMap, WALLET_ITEM_IDS } from "#src/services/inventory/constants";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { getItemName } from "#src/services/inventory/getItemName";

// The item a line's name names, among the wallet's currencies and the bag's materials, by the name the game shows each
// Under. A name no item holds is unknown, and one several hold is refused with the nearest names, as `resolveDevName` does
export const resolveDevItem = (item: string, tables: DevItemTables) => {
  const currencyCandidates = Object.values(Currency).map((currency) => ({
    id: CurrencyItemIdMap[currency],
    name: tables.gameText[CurrencyGameTextKeyMap[currency]],
  }));
  const materialCandidates = [...tables.materialDataMap.values()]
    .filter(({ id }) => !WALLET_ITEM_IDS.includes(id))
    .map(({ id, nameTextId }) => ({ id, name: getItemName(nameTextId, tables.nameText) }));
  return resolveDevName([...currencyCandidates, ...materialCandidates], ({ name }) => name, item, "item");
};
