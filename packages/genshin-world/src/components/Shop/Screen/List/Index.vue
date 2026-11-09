<script setup lang="ts">
import type { CurrencyCount, ShopGoodCell } from "genshin-interface";

import {
  GAME_CREAM,
  GAME_INK,
  GameButton,
  GameButtonKind,
  ScreenTitle,
  ShopScreenCloseButton,
  useShopGoodPick,
} from "genshin-interface";

interface Props {
  // The currencies the player holds, shown across the head
  balances: CurrencyCount[];
  // The Purchase button's label
  buyLabel: string;
  // The close button's name for assistive tech
  closeLabel: string;
  // The count picker's name for assistive tech
  countLabel: string;
  // The most the picked good can be bought for, its limit and the player's currency both counted
  countMaximum: number;
  // The goods the shop sells, in the shop's order, one under another
  goods: ShopGoodCell[];
  // The heading over where the shown good's item comes from, which its source box sits under
  sourceLabel: string;
  // The title the game shows over the list
  title: string;
}

const count = defineModel<number>("count", { default: 1 });
const goodId = defineModel<number>("goodId", { default: 0 });
const { countMaximum, goods } = defineProps<Props>();
const emit = defineEmits<{ buy: [good: ShopGoodCell, count: number]; close: [] }>();
// The good the player picked, if any, and the good the detail shows, which is the first good until one is picked
const { pickedCount, pickedGood, setCount } = useShopGoodPick({
  count,
  getCountMaximum: () => countMaximum,
  getGoods: () => goods,
  goodId,
});
const shownGood = computed(() => pickedGood.value ?? goods[0]);
</script>

<template>
  <!-- The General Goods list a single-list shop opens on: its goods one under another down the left, the shown good's
       detail beside them with its picture and Owned strip, the balances across the head, the item-refresh line and the
       Purchase button at the foot. The pixels are measured from the public General Goods clip at 34 seconds (the frame is
       kept outside the repo, its reference is `genshin-parity/references/shop-screen.png`) -->
  <div class="shop-list">
    <ScreenTitle class="heading" role="heading" aria-level="1">{{ title }}</ScreenTitle>
    <ul class="balances">
      <li v-for="balance of balances" :key="balance.id" class="balance">
        <span class="coin" role="img" :aria-label="balance.name" />
        {{ balance.quantity }}
      </li>
    </ul>
    <ShopScreenCloseButton :label="closeLabel" @click="emit('close')" />
    <ul class="goods">
      <li v-for="good of goods" :key="good.id">
        <GameButton
          class="good"
          :aria-pressed="good.id === shownGood?.id"
          :kind="GameButtonKind.Row"
          tip=""
          @click="goodId = good.id"
        >
          <span class="good-arrow" aria-hidden="true" />
          <span class="good-icon" />
          <span class="good-name">{{ good.name }}</span>
          <span v-if="good.purchaseLabel" class="good-limit">{{ good.purchaseLabel }}</span>
          <span class="good-costs">
            <span v-for="cost of good.costs" :key="cost.name" class="good-price price-line">
              <span class="coin" role="img" :aria-label="cost.name" />
              {{ cost.count }}
            </span>
          </span>
        </GameButton>
      </li>
    </ul>
    <section v-if="shownGood" class="detail" :aria-label="shownGood.name">
      <div class="detail-head">
        <p class="detail-name">{{ shownGood.name }}</p>
      </div>
      <div class="detail-art">
        <span class="detail-picture" />
      </div>
      <div class="detail-body">
        <p class="detail-source-label">{{ sourceLabel }}</p>
        <span class="detail-source" />
      </div>
      <div class="detail-owned">
        <p class="detail-owned-count">{{ shownGood.ownedLabel }}</p>
      </div>
    </section>
    <div v-if="pickedGood" class="amount-picker">
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
    </div>
    <p v-if="shownGood?.refreshLabel" class="refresh">{{ shownGood.refreshLabel }}</p>
    <GameButton
      class="buy"
      :disabled="countMaximum < 1"
      :kind="GameButtonKind.Row"
      tip=""
      @click="pickedGood && emit('buy', pickedGood, pickedCount)"
    >
      <span class="buy-icon" />
      {{ buyLabel }}
    </GameButton>
  </div>
</template>

<style scoped>
/* The world behind the list is the reference's own: its clear left and right margins read dark at the top and light at the
   bottom, so the screen fills the backdrop with the colour each height of those margins reads */
.shop-list {
  position: absolute;
  inset: 0;
  color: #f5f0e4;
  background: linear-gradient(
    rgb(37 36 48) calc(var(--unit) * 0),
    rgb(54 57 74) calc(var(--unit) * 100),
    rgb(64 68 81) calc(var(--unit) * 250),
    rgb(81 81 84) calc(var(--unit) * 400),
    rgb(95 98 102) calc(var(--unit) * 550),
    rgb(141 118 112) calc(var(--unit) * 700),
    rgb(128 153 155) calc(var(--unit) * 850),
    rgb(138 168 172) calc(var(--unit) * 960),
    rgb(138 166 171) calc(var(--unit) * 1040)
  );
}

.heading {
  position: absolute;
  top: calc(var(--unit) * 34);
  left: calc(var(--unit) * 143);
  color: #d9c48f;
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 30);
  letter-spacing: calc(var(--unit) * 2.5);
}

.balances {
  position: absolute;
  top: calc(var(--unit) * 30);
  left: calc(var(--unit) * 1578);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 16);
  height: calc(var(--unit) * 36);
  margin: 0;
  padding: 0 calc(var(--unit) * 16) 0 calc(var(--unit) * 14);
  border: calc(var(--unit) * 1) solid rgb(200 190 160 / 0.5);
  border-radius: calc(var(--unit) * 18);
  background: rgb(20 26 36 / 0.6);
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 26);
  list-style: none;
}

.balance {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 16);
}

.coin {
  display: inline-block;
  width: calc(var(--unit) * 26);
  height: calc(var(--unit) * 26);
  flex: none;
  border-radius: 50%;
  background: radial-gradient(circle, #f6d77a 0 35%, #c99a2e 36% 100%);
}

.goods {
  position: absolute;
  top: calc(var(--unit) * 118);
  left: calc(var(--unit) * 78);
  width: calc(var(--unit) * 1192);
  height: calc(var(--unit) * 840);
  margin: 0;
  padding: 0;
  overflow-y: auto;
  scrollbar-width: none;
  list-style: none;
}

.goods li {
  position: relative;
  height: calc(var(--unit) * 115.5);
}

.good {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 42);
  box-sizing: border-box;
  width: calc(var(--unit) * 1127);
  height: calc(var(--unit) * 104);
  padding: 0;
  border: calc(var(--unit) * 1) solid rgb(170 180 196 / 0.35);
  background: rgb(62 73 91 / 0.92);
  color: inherit;
  text-align: left;
  cursor: inherit;
}

.good[aria-pressed="true"] {
  left: calc(var(--unit) * 19);
  width: calc(var(--unit) * 1173);
  height: calc(var(--unit) * 110);
  border-color: #fbf8ef;
  background: #ebe4d3;
  color: #2b2a26;
}

/* The picked good's pointer, a triangle at its left edge, drawn in its own span so the good's lit tint keeps its pseudo-element */
.good-arrow {
  display: none;
}

.good[aria-pressed="true"] .good-arrow {
  display: block;
  position: absolute;
  top: calc(var(--unit) * 46);
  left: calc(var(--unit) * -19);
  border-width: calc(var(--unit) * 8) 0 calc(var(--unit) * 8) calc(var(--unit) * 12);
  border-style: solid;
  border-color: transparent transparent transparent #f3eee2;
}

.good-icon {
  position: absolute;
  top: calc(var(--unit) * 5);
  left: calc(var(--unit) * 5);
  width: calc(var(--unit) * 96);
  height: calc(var(--unit) * 96);
  background: rgb(93 99 110);
}

.good[aria-pressed="true"] .good-icon {
  background: rgb(145 146 147);
}

.good-name {
  position: absolute;
  top: calc(var(--unit) * 14);
  left: calc(var(--unit) * 120);
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 30);
}

.good-limit {
  position: absolute;
  top: calc(var(--unit) * 14);
  right: calc(var(--unit) * 24);
  box-sizing: border-box;
  height: calc(var(--unit) * 34);
  padding: 0 calc(var(--unit) * 11);
  border: calc(var(--unit) * 2) solid rgb(235 230 215 / 0.75);
  border-radius: calc(var(--unit) * 17);
  font-size: calc(var(--unit) * 23);
  line-height: calc(var(--unit) * 30);
  letter-spacing: calc(var(--unit) * 1.2);
}

.good[aria-pressed="true"] .good-limit {
  right: calc(var(--unit) * 14);
  border-color: rgb(120 118 110 / 0.7);
  color: #4a5164;
}

.good-costs {
  position: absolute;
  top: calc(var(--unit) * 60);
  left: calc(var(--unit) * 118);
  display: flex;
  gap: calc(var(--unit) * 16);
}

.good-price {
  line-height: calc(var(--unit) * 26);
}

.detail {
  position: absolute;
  top: calc(var(--unit) * 126);
  left: calc(var(--unit) * 1308);
  width: calc(var(--unit) * 492);
  height: calc(var(--unit) * 834);
}

.detail-head {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: 100%;
  height: calc(var(--unit) * 54);
  padding: 0 calc(var(--unit) * 28);
  border: calc(var(--unit) * 2) solid #a9b0c0;
  background: rgb(113 118 138);
  color: #f7f2e6;
}

.detail-name {
  margin: 0;
  font-size: calc(var(--unit) * 30);
  font-weight: 600;
  line-height: calc(var(--unit) * 34);
}

.detail-art {
  position: absolute;
  top: calc(var(--unit) * 54);
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 225);
  background: linear-gradient(rgb(115 121 130), rgb(101 106 119));
}

.detail-picture {
  position: absolute;
  top: calc(var(--unit) * 36);
  left: calc(var(--unit) * 312);
  width: calc(var(--unit) * 110);
  height: calc(var(--unit) * 150);
  background: rgb(167 171 177);
}

.detail-body {
  position: absolute;
  top: calc(var(--unit) * 279);
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 330);
  background: #ebe5d5;
}

.detail-source-label {
  position: absolute;
  top: calc(var(--unit) * 167);
  left: calc(var(--unit) * 67);
  margin: 0;
  color: #4a5164;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  line-height: calc(var(--unit) * 26);
  letter-spacing: calc(var(--unit) * 0.8);
}

.detail-source {
  position: absolute;
  top: calc(var(--unit) * 208);
  left: calc(var(--unit) * 32);
  box-sizing: border-box;
  width: calc(var(--unit) * 428);
  height: calc(var(--unit) * 62);
  border: calc(var(--unit) * 2) solid #cdc4ae;
}

.detail-owned {
  position: absolute;
  top: calc(var(--unit) * 786);
  left: 0;
  width: 100%;
  height: calc(var(--unit) * 48);
  background: rgb(254 231 186);
}

.detail-owned-count {
  margin: 0;
  color: #4a5164;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 48);
  letter-spacing: calc(var(--unit) * 0.6);
  text-align: center;
}

.amount-picker {
  position: absolute;
  top: calc(var(--unit) * 756);
  left: calc(var(--unit) * 1368);
  width: calc(var(--unit) * 420);
}

.amount {
  position: absolute;
  top: calc(var(--unit) * 6);
  left: 0;
  width: calc(var(--unit) * 360);
}

.amount-value {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 380);
  margin: 0;
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 30);
}

.refresh {
  position: absolute;
  top: calc(var(--unit) * 1008);
  left: calc(var(--unit) * 143);
  margin: 0;
  color: #efe9dc;
  font-size: calc(var(--unit) * 22);
  line-height: calc(var(--unit) * 24);
}

.buy {
  position: absolute;
  top: calc(var(--unit) * 990);
  left: calc(var(--unit) * 1570);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 12);
  width: calc(var(--unit) * 222);
  height: calc(var(--unit) * 60);
  padding: 0 0 0 calc(var(--unit) * 14);
  border: none;
  border-radius: calc(var(--unit) * 30);
  background: v-bind(GAME_CREAM);
  color: v-bind(GAME_INK);
  font-size: calc(var(--unit) * 26);
  line-height: calc(var(--unit) * 30);
  cursor: inherit;
}

.buy-icon {
  box-sizing: border-box;
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 36);
  flex: none;
  border: calc(var(--unit) * 4) solid #e8c46a;
  border-radius: 50%;
  background: v-bind(GAME_INK);
}

.buy:disabled {
  opacity: 0.4;
}
</style>

<style scoped src="genshin-interface/styles/shopScreen.css"></style>
