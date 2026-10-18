<script setup lang="ts">
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { CurrencyCount, ShopGoodCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { buyShopGoodCount } from "#src/services/shop/buyShopGoodCount";
import { checkIsShopGoodOffered } from "#src/services/shop/checkIsShopGoodOffered";
import { computeNextShopRefreshTime } from "#src/services/shop/computeNextShopRefreshTime";
import { computeShopGoodLeft } from "#src/services/shop/computeShopGoodLeft";
import { countShopPrice } from "#src/services/shop/countShopPrice";
import { discountShopGood } from "#src/services/shop/discountShopGood";
import { formatShopRefreshCountdown } from "#src/services/shop/formatShopRefreshCountdown";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";
import { ShopRefreshLimitGameTextKeyMap } from "#src/services/shop/ShopRefreshLimitGameTextKeyMap";
import { takeOne } from "@esposter/shared";
import { GameScreen, ShopScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The Adventure Rank the player has reached, which opens the goods that show from it
  adventureRank: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The shop's goods as its slice holds them, before their sale dates and rank are checked
  goods: ShopGood[];
  // The game's material table by item id, which each good's item is named and defined from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the items in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // The Reputation level the player has reached, which a city shop's Mora prices are discounted at
  reputationLevel: number;
}

const { adventureRank, gameText, goods, materialDataMap, nameText, reputationLevel } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
// Every good bought, by its id and the moment it was bought, which each good's limit is counted from
const purchases = defineModel<ShopPurchase[]>("purchases", { required: true });
const count = ref(1);
const goodId = ref(0);
const now = computed(() => Temporal.Now.instant());
// The goods on offer to this rank now, priced at the reputation the player has. A good is paid in a currency, or in an
// Item the bag holds, as a fish is
const offeredGoods = computed(() =>
  goods.flatMap((good) =>
    checkIsShopGoodOffered(good, adventureRank, now.value) ? [discountShopGood(good, reputationLevel)] : [],
  ),
);
const pickedGood = computed(() => offeredGoods.value.find((good) => good.goodsId === goodId.value));
// What a good is paid in, named by the currency's name when the wallet trades it, else by the bag's item
const getPriceName = (priceItemId: number): string => {
  const currency = ShopItemCurrencyMap[priceItemId];
  return currency === undefined
    ? getItemDefinition(priceItemId, nameText, materialDataMap).name
    : gameText[takeOne(CurrencyGameTextKeyMap, currency)];
};
const balances = computed<CurrencyCount[]>(() =>
  Array.from(new Set(offeredGoods.value.map(({ priceItemId }) => priceItemId)), (priceItemId) => ({
    id: String(priceItemId),
    name: getPriceName(priceItemId),
    quantity: countShopPrice(inventory.value, wallet.value, priceItemId),
  })),
);
const goodCells = computed<ShopGoodCell[]>(() =>
  offeredGoods.value.map((good) => {
    const left = computeShopGoodLeft(good, purchases.value, now.value);
    const limitKey = ShopRefreshLimitGameTextKeyMap[good.refresh];
    const nextRefreshTime = computeNextShopRefreshTime(good.refresh, now.value);
    return {
      id: good.goodsId,
      limitLabel:
        left === undefined || limitKey === undefined ? undefined : fillGameTextValues(gameText[limitKey], left),
      name: getItemDefinition(good.itemId, nameText, materialDataMap).name,
      price: good.priceCount,
      priceName: getPriceName(good.priceItemId),
      refreshLabel:
        nextRefreshTime === undefined
          ? undefined
          : fillGameTextValues(
              gameText[GameTextKey.ShopRefresh],
              formatShopRefreshCountdown(now.value.until(nextRefreshTime)),
            ),
    };
  }),
);
// The most the picked good can be bought for: its limit left and the player's currency both counted. A good with no
// Price is bought one at a time
const countMaximum = computed(() => {
  if (!pickedGood.value) return 0;
  const good = pickedGood.value;
  const left = computeShopGoodLeft(good, purchases.value, now.value) ?? Number.POSITIVE_INFINITY;
  const affordable =
    good.priceCount > 0
      ? Math.floor(countShopPrice(inventory.value, wallet.value, good.priceItemId) / good.priceCount)
      : 1;
  return Math.min(left, affordable);
});
// Buys the picked good as many times as the count asks, and keeps what the purchases leave when one was made
const buy = (good: ShopGoodCell, buyCount: number) => {
  const shopGood = offeredGoods.value.find(({ goodsId }) => goodsId === good.id);
  if (!shopGood) return;
  const bought = buyShopGoodCount(
    wallet.value,
    inventory.value,
    (itemId) => getItemDefinition(itemId, nameText, materialDataMap),
    purchases.value,
    shopGood,
    buyCount,
    adventureRank,
    now.value,
  );
  if (bought.purchases === purchases.value) return;
  inventory.value = bought.inventory;
  purchases.value = bought.purchases;
  wallet.value = bought.wallet;
  goodId.value = 0;
  count.value = 1;
};
</script>

<template>
  <!-- The shop a city vendor sells from, opened by their talk: the goods on offer to the player's rank, and the picked
       good's detail with its price, limit and refresh, the count the player buys and the Buy button -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Shop]">
    <ShopScreen
      v-model:count="count"
      v-model:good-id="goodId"
      :balances
      :buy-label="gameText[GameTextKey.ShopPurchase]"
      :close-label="gameText[GameTextKey.Back]"
      :count-label="gameText[GameTextKey.CraftingAmount]"
      :count-maximum
      :goods="goodCells"
      :tabs="[]"
      :title="gameText[GameTextKey.Shop]"
      @buy="(good, count) => buy(good, count)"
      @close="emit('close')"
    />
  </GameScreen>
</template>
