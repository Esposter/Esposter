import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import {
  MONTHLY_REFRESH_TYPE,
  PAIMON_BARGAINS_SHOP_TYPE,
  SHOP_CURRENCY_ITEM_IDS,
  SHOP_FATE_ITEM_IDS,
} from "#src/services/genshinAssets/shops/constants";
import { getShopGoodCosts } from "#src/services/genshinAssets/shops/getShopGoodCosts";

// Whether a good is one of Paimon's Bargains' Fates bought with a Masterless currency: a monthly good of its shop that is
// Not part of a rotation and costs no Primogems, Genesis Crystals or Mora. The rotation and the weapons and materials are
// The next step, and the Primogem Fates are the inventory's
export const checkIsPaimonsBargainsFateGood = (row: ExcelShopGoodsRow): boolean => {
  const costs = getShopGoodCosts(row);
  return (
    row.shopType === PAIMON_BARGAINS_SHOP_TYPE &&
    row.rotateId === 0 &&
    row.costHcoin === 0 &&
    row.costMcoin === 0 &&
    row.costScoin === 0 &&
    row.refreshType === MONTHLY_REFRESH_TYPE &&
    SHOP_FATE_ITEM_IDS.includes(row.itemId) &&
    costs.length > 0 &&
    costs.every(({ itemId }) => SHOP_CURRENCY_ITEM_IDS.includes(itemId))
  );
};
