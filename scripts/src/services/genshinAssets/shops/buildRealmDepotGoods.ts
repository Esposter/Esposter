import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { REALM_DEPOT_SHOP_TYPE, REALM_DEPOT_TABS } from "#src/services/genshinAssets/shops/constants";
import { toShopGoodSlice } from "#src/services/genshinAssets/shops/toShopGoodSlice";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The Realm Depot's goods, one record of the shops dataset for each of its tabs. Each good carries the sub tab the table
// Files it under, which is the tab the screen shows it on
export const buildRealmDepotGoods = (): Record<string, unknown> => {
  const rows = readExcelTable<ExcelShopGoodsRow>("ShopGoodsExcelConfigData");
  return Object.assign(
    {},
    ...REALM_DEPOT_TABS.map(({ stem, subTabId }) => ({
      [`${GameDataset.Shops}/${stem}`]: toShopGoodSlice(
        rows,
        (row) => row.shopType === REALM_DEPOT_SHOP_TYPE && row.subTabId === subTabId,
      ).map((good) => Object.assign(good, { tabId: subTabId })),
    })),
  );
};
