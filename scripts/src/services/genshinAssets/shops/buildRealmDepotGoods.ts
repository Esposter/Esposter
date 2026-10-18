import { buildShopGoodSlice } from "#src/services/genshinAssets/shops/buildShopGoodSlice";
import { REALM_DEPOT_SHOP_TYPE, REALM_DEPOT_TABS } from "#src/services/genshinAssets/shops/constants";

// The Realm Depot's goods, one record of the shops dataset for each of its tabs, each tab's goods by the sub tab the table
// Files them under
export const buildRealmDepotGoods = (): Record<string, unknown> =>
  Object.assign(
    {},
    ...REALM_DEPOT_TABS.map(({ stem, subTabId }) =>
      buildShopGoodSlice((row) => row.shopType === REALM_DEPOT_SHOP_TYPE && row.subTabId === subTabId, stem),
    ),
  );
