<script setup lang="ts">
import type { CurrencyCount } from "#src/models/CurrencyCount";
import type { ShopGoodCell } from "#src/models/ShopGoodCell";
import type { ShopTabCell } from "#src/models/ShopTabCell";

import DiscButton from "#src/components/DiscButton/Index.vue";
import ScreenTitle from "#src/components/ScreenTitle/Index.vue";

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
// The good the player picked, whose detail the screen shows over the goods grid
const pickedGood = computed(() => goods.find((good) => good.id === goodId.value));
// The count kept within the picked good's most, never less than one so the picker still reads as a count
const pickedCount = computed(() => Math.min(Math.max(count.value, 1), Math.max(countMaximum, 1)));
const setCount = (event: Event) => {
  count.value = Number((event.target as HTMLInputElement).value);
};
const buy = () => {
  if (pickedGood.value && countMaximum >= 1) emit("buy", pickedGood.value, pickedCount.value);
};
</script>

<template>
  <!-- The Shop screen, its pieces placed in the game's own pixels at 1080 high (`--unit` a pixel of that frame): the title
       and the balances across the head, the way out at the head's right, the tabs under them and the goods grid below. A
       picked good opens its detail over the grid, with its price, limit and refresh, the count picker and the Buy button -->
  <div class="shop-screen">
    <ScreenTitle class="heading" role="heading" aria-level="1">{{ title }}</ScreenTitle>
    <ul class="balances">
      <li v-for="balance of balances" :key="balance.id" class="balance">
        <span class="balance-icon" role="img" :aria-label="balance.name" />
        {{ balance.quantity }}
        <span v-if="balance.isTopUp" class="top-up" aria-hidden="true">+</span>
      </li>
    </ul>
    <DiscButton class="close" :label="closeLabel" :size="56" @click="emit('close')">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6 18 18M18 6 6 18" />
      </svg>
    </DiscButton>
    <ul v-if="tabs.length > 0" class="tabs">
      <li v-for="tab of tabs" :key="tab.id">
        <button class="tab" :aria-pressed="tab.id === tabId" type="button" @click="tabId = tab.id">
          {{ tab.name }}
        </button>
      </li>
    </ul>
    <ul class="goods">
      <li v-for="good of goods" :key="good.id">
        <button class="good" :aria-pressed="good.id === goodId" type="button" @click="goodId = good.id">
          <span class="good-name">{{ good.name }}</span>
          <span v-if="good.limitLabel" class="good-limit">{{ good.limitLabel }}</span>
          <span class="good-price">
            <span class="price-icon" role="img" :aria-label="good.priceName" />
            {{ good.price }}
          </span>
        </button>
      </li>
    </ul>
    <div v-if="pickedGood" class="detail" role="dialog" aria-modal="true" :aria-label="pickedGood.name">
      <div class="detail-good">
        <p class="detail-name">{{ pickedGood.name }}</p>
        <p class="detail-price">
          <span class="price-icon" role="img" :aria-label="pickedGood.priceName" />
          {{ pickedGood.price * pickedCount }}
        </p>
        <p v-if="pickedGood.limitLabel" class="detail-line">{{ pickedGood.limitLabel }}</p>
        <p v-if="pickedGood.refreshLabel" class="detail-line">{{ pickedGood.refreshLabel }}</p>
      </div>
      <input
        :aria-label="countLabel"
        class="amount"
        :max="countMaximum"
        min="1"
        type="range"
        :value="pickedCount"
        @input="(event) => setCount(event)"
      />
      <p class="amount-value">{{ pickedCount }}</p>
      <button class="cancel" :aria-label="closeLabel" type="button" @click="goodId = 0">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6 18 18M18 6 6 18" />
        </svg>
      </button>
      <button class="buy" :disabled="countMaximum < 1" type="button" @click="buy()">{{ buyLabel }}</button>
    </div>
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

.close {
  position: absolute;
  top: calc(var(--unit) * 19);
  left: calc(var(--unit) * 1815);
}

.close svg,
.cancel svg {
  width: calc(var(--unit) * 24);
  height: calc(var(--unit) * 24);
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-width: 3;
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
  outline: calc(var(--unit) * 2) solid #fdfdfd;
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

.price-icon {
  width: calc(var(--unit) * 18);
  height: calc(var(--unit) * 18);
  background: #7aa9e8;
  transform: rotate(45deg);
}

.detail {
  position: absolute;
  top: calc(var(--unit) * 250);
  left: calc(var(--unit) * 505);
  width: calc(var(--unit) * 910);
  height: calc(var(--unit) * 580);
  background: #e8e1cd;
  color: #2b2a26;
}

.detail-good {
  position: absolute;
  top: calc(var(--unit) * 95);
  left: calc(var(--unit) * 65);
  display: flex;
  width: calc(var(--unit) * 780);
  height: calc(var(--unit) * 170);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: calc(var(--unit) * 8);
  background: #6f78ab;
  color: #fff7ea;
}

.detail-good p {
  margin: 0;
}

.detail-name {
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
  line-height: calc(var(--unit) * 34);
}

.detail-price {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 10);
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 28);
}

.detail-line {
  font-size: calc(var(--unit) * 18);
  line-height: calc(var(--unit) * 22);
}

.amount {
  position: absolute;
  top: calc(var(--unit) * 380);
  left: calc(var(--unit) * 183);
  width: calc(var(--unit) * 540);
  height: calc(var(--unit) * 14);
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: inherit;
}

.amount::-webkit-slider-runnable-track {
  height: calc(var(--unit) * 4);
  background: #9aa3b8;
}

.amount::-webkit-slider-thumb {
  width: calc(var(--unit) * 14);
  height: calc(var(--unit) * 14);
  margin-top: calc(var(--unit) * -5);
  border-radius: calc(var(--unit) * 2);
  background: #2b2a26;
  transform: rotate(45deg);
  appearance: none;
}

.amount-value {
  position: absolute;
  top: calc(var(--unit) * 366);
  left: calc(var(--unit) * 728);
  margin: 0;
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 30);
}

.cancel,
.buy {
  position: absolute;
  top: calc(var(--unit) * 478);
  height: calc(var(--unit) * 62);
  padding: 0;
  border: none;
  border-radius: calc(var(--unit) * 4);
  cursor: inherit;
}

.cancel {
  left: calc(var(--unit) * 70);
  width: calc(var(--unit) * 145);
  background: #6f78ab;
  color: #fff7ea;
}

.buy {
  left: calc(var(--unit) * 630);
  width: calc(var(--unit) * 210);
  background: #3d4a68;
  color: #fff7ea;
  font-size: calc(var(--unit) * 24);
}

.buy:disabled {
  opacity: 0.4;
}
</style>
