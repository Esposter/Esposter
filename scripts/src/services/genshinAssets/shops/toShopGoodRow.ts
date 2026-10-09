import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";
import type { ShopGoodRow } from "#src/models/genshinAssets/shops/ShopGoodRow";

import {
  GAME_TIME_OFFSET,
  MORA_ITEM_ID,
  SHOP_REFRESH_BY_TABLE_TYPE,
} from "#src/services/genshinAssets/shops/constants";
import { getShopGoodPrice } from "#src/services/genshinAssets/shops/getShopGoodPrice";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One good as the world reads it, its game-time dates written as ISO strings with the game's offset. A good priced in Mora
// Takes the table's Mora cost; one bought with something other than one item or Mora has no price the world can take, so
// It is an error rather than a free good
export const toShopGoodRow = (row: ExcelShopGoodsRow): ShopGoodRow => {
  const price = row.costScoin > 0 ? { count: row.costScoin, id: MORA_ITEM_ID } : getShopGoodPrice(row);
  if (!price)
    throw new InvalidOperationError(Operation.Read, "shop good", `good ${row.goodsId} has no single item price`);
  const refresh = SHOP_REFRESH_BY_TABLE_TYPE[row.refreshType];
  if (!refresh)
    throw new InvalidOperationError(Operation.Read, "shop good", `good ${row.goodsId} has no known refresh`);
  return {
    beginTime: `${row.beginTime.replace(" ", "T")}${GAME_TIME_OFFSET}`,
    buyLimit: row.buyLimit,
    endTime: `${row.endTime.replace(" ", "T")}${GAME_TIME_OFFSET}`,
    goodsId: row.goodsId,
    itemCount: row.itemCount,
    itemId: row.itemId,
    minPlayerLevel: row.minPlayerLevel,
    priceCount: price.count,
    priceItemId: price.id,
    refresh,
  };
};
