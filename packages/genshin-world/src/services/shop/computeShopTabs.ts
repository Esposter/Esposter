import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopTabCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { RealmDepotTabGameTextKeyMap } from "#src/services/shop/RealmDepotTabGameTextKeyMap";

// The tabs a shop's goods are shown on, in the order its goods list them, each named by its text. A good with no tab is
// Not on one, so a shop whose goods carry none has no tabs and its goods are one list
export const computeShopTabs = (goods: readonly Pick<ShopGood, "tabId">[], gameText: GameText): ShopTabCell[] => {
  const tabIds = [...new Set(goods.flatMap(({ tabId }) => (tabId === undefined ? [] : [tabId])))];
  return tabIds.flatMap((id) => {
    const nameKey = RealmDepotTabGameTextKeyMap[id];
    return nameKey === undefined ? [] : [{ id, name: gameText[nameKey] }];
  });
};
