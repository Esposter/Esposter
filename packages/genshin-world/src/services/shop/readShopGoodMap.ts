import type { ShopGood } from "#src/models/shop/ShopGood";

import { shopGoodSchema } from "#src/models/shop/ShopGood";
import { readGameData } from "#src/services/data/readGameData";
import { SHOP_GOODS_KEYS } from "#src/services/shop/constants";
import { z } from "zod";

// The goods of each city vendor's shop, by the shop's id, read from the shops datasets its keys name and checked against
// Its shape as it arrives. A shop whose goods are split across keys has them read in the keys' order, as one list
export const readShopGoodMap = async (gameDataBaseUrl: string): Promise<Map<number, ShopGood[]>> => {
  const entries = await Promise.all(
    SHOP_GOODS_KEYS.map(async ([shopId, keys]) => {
      const goodLists = await Promise.all(
        keys.map((key) => readGameData(gameDataBaseUrl, key, z.array(shopGoodSchema))),
      );
      return [shopId, goodLists.flat()] as const;
    }),
  );
  return new Map(entries);
};
