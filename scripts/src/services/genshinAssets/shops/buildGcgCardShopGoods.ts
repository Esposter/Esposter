import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";

import { buildShopGoodSlice } from "#src/services/genshinAssets/shops/buildShopGoodSlice";
import {
  GCG_CARD_SHOP_ID,
  GCG_CARD_SHOP_TYPE,
  GCG_LUCKY_COIN_ITEM_ID,
} from "#src/services/genshinAssets/shops/constants";
import { getShopGoodPrice } from "#src/services/genshinAssets/shops/getShopGoodPrice";

// The Card Shop's goods, one record of the shops dataset: the goods filed under its shop type, numbered in its shop and priced
// In Lucky Coins. Of its 330 goods, 104 sell a card, and the rest sell items the card table does not hold
export const buildGcgCardShopGoods = (): Record<string, unknown> =>
  buildShopGoodSlice(
    (row: ExcelShopGoodsRow) =>
      row.shopType === GCG_CARD_SHOP_TYPE &&
      Math.floor(row.goodsId / 1000) === GCG_CARD_SHOP_ID &&
      getShopGoodPrice(row)?.id === GCG_LUCKY_COIN_ITEM_ID,
    "gcgCardShop",
  );
