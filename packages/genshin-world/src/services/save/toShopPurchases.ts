import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { ShopPurchaseSave } from "#src/models/shop/ShopPurchaseSave";

// The save's purchases with each moment read back into its Temporal instant
export const toShopPurchases = (shopPurchases: ShopPurchaseSave[]): ShopPurchase[] =>
  shopPurchases.map(({ count, goodsId, lastPurchasedAt }) => ({
    count,
    goodsId,
    lastPurchasedAt: Temporal.Instant.from(lastPurchasedAt),
  }));
