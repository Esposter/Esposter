import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { ShopPurchaseSave } from "#src/models/shop/ShopPurchaseSave";

// The purchases as the save holds them, each moment as its ISO string
export const toShopPurchaseSaves = (shopPurchases: ShopPurchase[]): ShopPurchaseSave[] =>
  shopPurchases.map(({ count, goodsId, lastPurchasedAt }) => ({
    count,
    goodsId,
    lastPurchasedAt: lastPurchasedAt.toString(),
  }));
