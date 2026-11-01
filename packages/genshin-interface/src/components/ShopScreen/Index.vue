<script setup lang="ts">
import type { CurrencyCount } from "#src/models/CurrencyCount";
import type { ShopGoodCell } from "#src/models/ShopGoodCell";
import type { ShopTabCell } from "#src/models/ShopTabCell";

import GameButton from "#src/components/GameButton/Index.vue";
import ScreenTitle from "#src/components/ScreenTitle/Index.vue";
import ShopScreenCloseButton from "#src/components/ShopScreen/CloseButton/Index.vue";
import ShopScreenDetail from "#src/components/ShopScreen/Detail/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { GAME_WHITE } from "#src/services/constants";
import { useShopGoodPick } from "#src/services/useShopGoodPick";

interface Props {
  // The currencies the player holds, shown across the head, the top-up ones with a plus
  balances: CurrencyCount[];
  // The Buy button's label
  buyLabel: string;
  // The close button's name for assistive tech, and the detail's cancel
  closeLabel: string;
  // The count picker's name for assistive tech
  countLabel: string;
  // The most the picked good can be bought for, its limit and the player's currency both counted
  countMaximum: number;
  // The goods the picked tab sells, in the shop's order
  goods: ShopGoodCell[];
  // The shop's tabs, in the game's order; none where the shop has one list
  tabs: ShopTabCell[];
  // The title the game shows over the shop
  title: string;
}

const count = defineModel<number>("count", { default: 1 });
const goodId = defineModel<number>("goodId", { default: 0 });
const tabId = defineModel<number>("tabId", { default: 0 });
const { balances, buyLabel, closeLabel, countLabel, countMaximum, goods, tabs, title } = defineProps<Props>();
const emit = defineEmits<{ buy: [good: ShopGoodCell, count: number]; close: [] }>();
// The good the player picked, whose detail the screen shows over the goods grid, and the count it is bought for
const { pickedCount, pickedGood } = useShopGoodPick({
  count,
  getCountMaximum: () => countMaximum,
  getGoods: () => goods,
  goodId,
});
</script>

<template>
  <!-- The Shop screen, its pieces placed in the game's own pixels at 1080 high (`--unit` a pixel of that frame): the title
       and the balances across the head, the way out at the head's right, the tabs under them and the goods grid below. A
       picked good opens its detail over the grid, with its costs, limit and refresh, the count picker and the Buy button.
       The pixels are measured from the public Paimon's Bargains purchase clip aJq1MnTPtZ4 at 12 seconds (the frame is kept
       outside the repo): the panel at 505 by 250, the grid's four columns of 310 with gaps of 32, the Buy button at 1135 to
       1345 by 728 to 790 -->
  <div class="shop-screen">
    <ScreenTitle class="heading" role="heading" aria-level="1">{{ title }}</ScreenTitle>
    <ul class="balances">
      <li v-for="balance of balances" :key="balance.id" class="balance">
        <span class="balance-icon" role="img" :aria-label="balance.name" />
        {{ balance.quantity }}
        <span v-if="balance.isTopUp" class="top-up" aria-hidden="true">+</span>
      </li>
    </ul>
    <ShopScreenCloseButton :label="closeLabel" @click="emit('close')" />
    <ul v-if="tabs.length > 0" class="tabs">
      <li v-for="tab of tabs" :key="tab.id">
        <GameButton
          class="tab"
          :aria-pressed="tab.id === tabId"
          :kind="GameButtonKind.Row"
          tip=""
          @click="tabId = tab.id"
        >
          {{ tab.name }}
        </GameButton>
      </li>
    </ul>
    <ul class="goods">
      <li v-for="good of goods" :key="good.id">
        <GameButton
          class="good"
          :aria-pressed="good.id === goodId"
          :data-tone="good.tone"
          :kind="GameButtonKind.Row"
          tip=""
          @click="goodId = good.id"
        >
          <span class="good-name">{{ good.name }}</span>
          <span v-if="good.limitLabel" class="good-limit">{{ good.limitLabel }}</span>
          <span v-for="cost of good.costs" :key="cost.name" class="good-price">
            <span class="price-icon" role="img" :aria-label="cost.name" />
            {{ cost.count }}
          </span>
        </GameButton>
      </li>
    </ul>
    <ShopScreenDetail
      v-if="pickedGood"
      v-model:count="count"
      :buy-label="buyLabel"
      :close-label="closeLabel"
      :count-label="countLabel"
      :count-maximum="countMaximum"
      :good="pickedGood"
      :picked-count="pickedCount"
      @buy="(good, buyCount) => emit('buy', good, buyCount)"
      @close="goodId = 0"
    />
  </div>
</template>

<style scoped>
.shop-screen {
  position: absolute;
  inset: 0;
  color: #fff7ea;
}

.heading {
  position: absolute;
  top: calc(var(--unit) * 14);
  left: calc(var(--unit) * 34);
  line-height: calc(var(--unit) * 40);
}

.balances {
  position: absolute;
  top: calc(var(--unit) * 34);
  left: calc(var(--unit) * 1296);
  display: flex;
  gap: calc(var(--unit) * 36);
  margin: 0;
  padding: 0;
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 26);
  list-style: none;
}

.balance {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 8);
}

.balance-icon {
  width: calc(var(--unit) * 20);
  height: calc(var(--unit) * 20);
  background: #7aa9e8;
  transform: rotate(45deg);
}

.top-up {
  margin-left: calc(var(--unit) * 4);
  color: #e8d9b0;
}

.tabs {
  position: absolute;
  top: calc(var(--unit) * 97);
  left: calc(var(--unit) * 440);
  display: flex;
  gap: calc(var(--unit) * 40);
  margin: 0;
  padding: 0;
  list-style: none;
}

.tab {
  height: calc(var(--unit) * 60);
  padding: 0 calc(var(--unit) * 22);
  border: none;
  background: none;
  color: inherit;
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 26);
  cursor: inherit;
}

.tab[aria-pressed="true"] {
  background: #ede5d7;
  color: #2b2a26;
}

.goods {
  position: absolute;
  top: calc(var(--unit) * 200);
  left: calc(var(--unit) * 450);
  display: grid;
  grid-template-columns: repeat(4, calc(var(--unit) * 310));
  gap: calc(var(--unit) * 32);
  width: calc(var(--unit) * 1350);
  height: calc(var(--unit) * 860);
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.good {
  position: relative;
  width: 100%;
  height: calc(var(--unit) * 296);
  padding: 0;
  border: none;
  background: #6f78ab;
  color: inherit;
  cursor: inherit;
}

.good[aria-pressed="true"] {
  outline: calc(var(--unit) * 2) solid v-bind(GAME_WHITE);
}

.good-name {
  position: absolute;
  top: calc(var(--unit) * 166);
  right: calc(var(--unit) * 8);
  left: calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 26);
  text-align: center;
}

.good-limit {
  position: absolute;
  top: calc(var(--unit) * 214);
  right: calc(var(--unit) * 8);
  left: calc(var(--unit) * 8);
  font-size: calc(var(--unit) * 18);
  line-height: calc(var(--unit) * 22);
  text-align: center;
}

.good-price {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--unit) * 10);
  height: calc(var(--unit) * 48);
  background: #5b6882;
  font-size: calc(var(--unit) * 24);
}
</style>

<style scoped src="../../styles/shopScreen.css"></style>
