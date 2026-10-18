import type { ShopGood } from "#src/models/shop/ShopGood";

import { shopGoodSchema } from "#src/models/shop/ShopGood";
import { readGameData } from "#src/services/data/readGameData";
import { SHOP_GOODS_KEYS } from "#src/services/shop/constants";
import { z } from "zod";

// The goods of each city vendor's shop, by the shop's id, read from the shops dataset its key names and checked against
// Its shape as it arrives
export const readShopGoodMap = async (gameDataBaseUrl: string): Promise<Map<number, ShopGood[]>> => {
  const entries = await Promise.all(
    SHOP_GOODS_KEYS.map(async ([shopId, key]) => {
      const goods = await readGameData(gameDataBaseUrl, key, z.array(shopGoodSchema));
      return [shopId, goods] as const;
    }),
  );
  return new Map(entries);
};
