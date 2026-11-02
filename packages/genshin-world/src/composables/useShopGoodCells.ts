import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { ShopGoodCell } from "genshin-interface";
import type { GameText } from "genshin-text";
import type { ComputedRef, Ref } from "vue";

import { computeNextShopRefreshTime } from "#src/services/shop/computeNextShopRefreshTime";
import { computeShopGoodLeft } from "#src/services/shop/computeShopGoodLeft";
import { countShopCost } from "#src/services/shop/countShopCost";
import { formatShopRefreshCountdown } from "#src/services/shop/formatShopRefreshCountdown";
import { ShopRefreshLimitGameTextKeyMap } from "#src/services/shop/ShopRefreshLimitGameTextKeyMap";
import { fillGameTextValues, GameTextKey } from "genshin-text";
import { computed } from "vue";

// The goods a shop screen draws, each with the name it is drawn under, its costs named by the currency or item they are
// Paid in, the count the player holds of its item, and the limit it has left and the refresh it reads from the moment the
// Clock gives
export const useShopGoodCells = ({
  getCostName,
  getGameText,
  getNow,
  goods,
  inventory,
  purchases,
  wallet,
}: {
  getCostName: (itemId: number) => string;
  getGameText: () => GameText;
  getNow: () => Temporal.Instant;
  goods: ComputedRef<{ good: Pick<ShopGood, "buyLimit" | "costs" | "goodsId" | "itemId" | "refresh">; name: string }[]>;
  inventory: Readonly<Ref<Inventory>>;
  purchases: Readonly<Ref<ShopPurchase[]>>;
  wallet: Readonly<Ref<Wallet>>;
}) =>
  computed<ShopGoodCell[]>(() => {
    const gameText = getGameText();
    const now = getNow();
    return goods.value.map(({ good, name }) => {
      const left = computeShopGoodLeft(good, purchases.value, now);
      const limitKey = ShopRefreshLimitGameTextKeyMap[good.refresh];
      const nextRefreshTime = computeNextShopRefreshTime(good.refresh, now);
      return {
        costs: good.costs.map((cost) => ({ count: cost.count, name: getCostName(cost.itemId) })),
        id: good.goodsId,
        limitLabel: left === undefined || limitKey === undefined ? "" : fillGameTextValues(gameText[limitKey], left),
        name,
        ownedLabel: fillGameTextValues(
          gameText[GameTextKey.ShopOwned],
          countShopCost(inventory.value, wallet.value, good.itemId),
        ),
        purchaseLabel:
          left === undefined
            ? ""
            : fillGameTextValues(gameText[GameTextKey.ShopPurchaseUpTo], `${left}/${good.buyLimit}`),
        refreshLabel:
          nextRefreshTime === undefined
            ? ""
            : fillGameTextValues(
                gameText[GameTextKey.ShopRefresh],
                formatShopRefreshCountdown(now.until(nextRefreshTime)),
              ),
      };
    });
  });
