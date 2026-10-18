import type { ExcelShopGoodsRow } from "#src/models/genshinAssets/shops/ExcelShopGoodsRow";
import type { ShopGoodRow } from "#src/models/genshinAssets/shops/ShopGoodRow";

import {
  GAME_TIME_OFFSET,
  SHOP_REFRESH_BY_TABLE_TYPE,
  SHOP_REFRESH_NONE_TABLE_TYPE,
} from "#src/services/genshinAssets/shops/constants";
import { getShopGoodCosts } from "#src/services/genshinAssets/shops/getShopGoodCosts";
import { InvalidOperationError, Operation } from "@esposter/shared";

// One good as the world reads it, its game-time dates written as ISO strings with the game's offset, and every cost it is
// Bought with. A good the table gives no cost for is an error rather than a free good
export const toShopGoodRow = (row: ExcelShopGoodsRow, reputationDiscountLevel?: number): ShopGoodRow => {
  const costs = getShopGoodCosts(row);
  if (costs.length === 0)
    throw new InvalidOperationError(Operation.Read, "shop good", `good ${row.goodsId} has no cost`);
  const refresh = SHOP_REFRESH_BY_TABLE_TYPE[row.refreshType ?? SHOP_REFRESH_NONE_TABLE_TYPE];
  if (!refresh)
    throw new InvalidOperationError(Operation.Read, "shop good", `good ${row.goodsId} has no known refresh`);
  return {
    beginTime: `${row.beginTime.replace(" ", "T")}${GAME_TIME_OFFSET}`,
    buyLimit: row.buyLimit,
    costs,
    endTime: `${row.endTime.replace(" ", "T")}${GAME_TIME_OFFSET}`,
    goodsId: row.goodsId,
    itemCount: row.itemCount,
    itemId: row.itemId,
    minPlayerLevel: row.minPlayerLevel,
    refresh,
    ...(reputationDiscountLevel === undefined ? {} : { reputationDiscountLevel }),
  };
};
