import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { ShopGoodCell } from "genshin-interface";
import type { GameText } from "genshin-text";
import type { ComputedRef, Ref } from "vue";

import { computeNextShopRefreshTime } from "#src/services/shop/computeNextShopRefreshTime";
import { computeShopGoodLeft } from "#src/services/shop/computeShopGoodLeft";
import { formatShopRefreshCountdown } from "#src/services/shop/formatShopRefreshCountdown";
import { ShopRefreshLimitGameTextKeyMap } from "#src/services/shop/ShopRefreshLimitGameTextKeyMap";
import { fillGameTextValues, GameTextKey } from "genshin-text";
import { computed } from "vue";

// The goods a shop screen draws, each with the name it is drawn under, its costs named by the currency or item they are
// Paid in, and the limit it has left and the refresh it reads from the moment the clock gives
export const useShopGoodCells = ({
  getCostName,
  getGameText,
  getNow,
  goods,
  purchases,
}: {
  getCostName: (itemId: number) => string;
  getGameText: () => GameText;
  getNow: () => Temporal.Instant;
  goods: ComputedRef<{ good: Pick<ShopGood, "buyLimit" | "costs" | "goodsId" | "refresh">; name: string }[]>;
  purchases: Readonly<Ref<ShopPurchase[]>>;
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
