<script setup lang="ts">
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { ShopGood } from "#src/models/shop/ShopGood";
import type { ShopPurchase } from "#src/models/shop/ShopPurchase";
import type { CurrencyCount, ShopGoodCell } from "genshin-interface";
import type { GameText } from "genshin-text";

import { useShopGoodCells } from "#src/composables/useShopGoodCells";
import { useShopPick } from "#src/composables/useShopPick";
import { CurrencyGameTextKeyMap } from "#src/services/inventory/CurrencyGameTextKeyMap";
import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { buyShopGoodCount } from "#src/services/shop/buyShopGoodCount";
import { checkIsShopGoodOffered } from "#src/services/shop/checkIsShopGoodOffered";
import { computeShopGoodLeft } from "#src/services/shop/computeShopGoodLeft";
import { computeShopTabs } from "#src/services/shop/computeShopTabs";
import { countShopCost } from "#src/services/shop/countShopCost";
import { discountShopGood } from "#src/services/shop/discountShopGood";
import { ShopItemCurrencyMap } from "#src/services/shop/ShopItemCurrencyMap";
import { takeOne } from "@esposter/shared";
import { GameScreen, ShopScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The Adventure Rank the player has reached, which opens the goods that show from it
  adventureRank: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The world's clock as a purchase reads it at the moment the purchase is made
  getWorldNow: () => Temporal.Instant;
  // The shop's goods as its slice holds them, before their sale dates and rank are checked
  goods: ShopGood[];
  // The game's material table by item id, which each good's item is named and defined from
  materialDataMap: ReadonlyMap<number, MaterialData>;
  // The names of the items in the reader's language, by their game text ids
  nameText: Readonly<Record<string, string>>;
  // The world's clock as the screen shows it, which the goods on offer and their limits and refreshes are read at
  now: Temporal.Instant;
  // The Reputation level the player has reached, which a city shop's Mora prices are discounted at
  reputationLevel: number;
}

const { adventureRank, gameText, getWorldNow, goods, materialDataMap, nameText, now, reputationLevel } =
  defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const { count, goodId, resetShopPick } = useShopPick();
const inventory = defineModel<Inventory>("inventory", { required: true });
const wallet = defineModel<Wallet>("wallet", { required: true });
// Every good bought, by its id and the moment it was bought, which each good's limit is counted from
const purchases = defineModel<ShopPurchase[]>("purchases", { required: true });
// The tab the goods are shown on, by its id, where the shop has tabs: the first until the player picks another
const tabId = ref(0);
const tabs = computed(() => computeShopTabs(goods, gameText));
const pickedTabId = computed(() => tabs.value.find(({ id }) => id === tabId.value)?.id ?? tabs.value[0]?.id);
// The goods on offer to this rank now, on the picked tab where the shop has tabs, priced at the reputation the player has. A
// Good's costs are currencies, or items the bag holds, as a fish is
const offeredGoods = computed(() =>
  goods.flatMap((good) =>
    checkIsShopGoodOffered(good, adventureRank, now) &&
    (pickedTabId.value === undefined || good.tabId === pickedTabId.value)
      ? [discountShopGood(good, reputationLevel)]
      : [],
  ),
);
const pickedGood = computed(() => offeredGoods.value.find((good) => good.goodsId === goodId.value));
// What a cost is paid in, named by the currency's name when the wallet trades it, else by the bag's item
const getCostName = (itemId: number): string => {
  const currency = ShopItemCurrencyMap[itemId];
  return currency === undefined
    ? getItemDefinition(itemId, nameText, materialDataMap).name
    : gameText[takeOne(CurrencyGameTextKeyMap, currency)];
};
const balances = computed<CurrencyCount[]>(() =>
  Array.from(new Set(offeredGoods.value.flatMap(({ costs }) => costs.map(({ itemId }) => itemId))), (itemId) => ({
    id: String(itemId),
    isTopUp: false,
    name: getCostName(itemId),
    quantity: countShopCost(inventory.value, wallet.value, itemId),
  })),
);
const goodCells = useShopGoodCells({
  getCostName,
  getGameText: () => gameText,
  getNow: () => now,
  goods: computed(() =>
    offeredGoods.value.map((good) => ({ good, name: getItemDefinition(good.itemId, nameText, materialDataMap).name })),
  ),
  purchases,
});
// The most the picked good can be bought for: its limit left and every cost the player holds counted, the dearest cost
// Limiting it. A cost of nothing is bought one at a time
const countMaximum = computed(() => {
  if (!pickedGood.value) return 0;
  const good = pickedGood.value;
  const left = computeShopGoodLeft(good, purchases.value, now) ?? Number.POSITIVE_INFINITY;
  const affordable = Math.min(
    ...good.costs.map((cost) =>
      cost.count > 0 ? Math.floor(countShopCost(inventory.value, wallet.value, cost.itemId) / cost.count) : 1,
    ),
  );
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
    getWorldNow(),
  );
  if (bought.purchases === purchases.value) return;
  inventory.value = bought.inventory;
  purchases.value = bought.purchases;
  wallet.value = bought.wallet;
  resetShopPick();
};
</script>

<template>
  <!-- The shop a city vendor sells from, opened by their talk: the goods on offer to the player's rank, and the picked
       good's detail with its costs, limit and refresh, the count the player buys and the Buy button -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.Shop]">
    <ShopScreen
      v-model:count="count"
      v-model:good-id="goodId"
      v-model:tab-id="tabId"
      :balances
      :buy-label="gameText[GameTextKey.ShopPurchase]"
      :close-label="gameText[GameTextKey.Back]"
      :count-label="gameText[GameTextKey.CraftingAmount]"
      :count-maximum
      :goods="goodCells"
      :tabs
      :title="gameText[GameTextKey.Shop]"
      @buy="(good, count) => buy(good, count)"
      @close="emit('close')"
    />
  </GameScreen>
</template>
