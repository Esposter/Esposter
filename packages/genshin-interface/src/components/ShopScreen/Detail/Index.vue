<script setup lang="ts">
import type { ShopGoodCell } from "#src/models/ShopGoodCell";

import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The Buy button's label
  buyLabel: string;
  // The close button's name for assistive tech, and the detail's cancel
  closeLabel: string;
  // The count picker's name for assistive tech
  countLabel: string;
  // The most the picked good can be bought for, its limit and the player's currency both counted
  countMaximum: number;
  // The good the player picked, whose costs, limit and refresh the detail shows
  good: ShopGoodCell;
  // The count kept within the picked good's most, which the detail shows and the Buy button buys
  pickedCount: number;
}

// The count the player picked, which the slider writes and the screen keeps within the good's most
const count = defineModel<number>("count", { default: 1 });
defineProps<Props>();
const emit = defineEmits<{ buy: [good: ShopGoodCell, count: number]; close: [] }>();
</script>

<template>
  <!-- The detail of the picked good over the shop's grid: its costs, limit and refresh, the count picker, and the Buy button -->
  <div class="detail" role="dialog" aria-modal="true" :aria-label="good.name">
    <div class="detail-good">
      <p class="detail-name">{{ good.name }}</p>
      <p v-for="cost of good.costs" :key="cost.name" class="detail-price price-line">
        <span class="price-icon" role="img" :aria-label="cost.name" />
        {{ cost.count * pickedCount }}
      </p>
      <p v-if="good.limitLabel" class="detail-line">{{ good.limitLabel }}</p>
      <p v-if="good.refreshLabel" class="detail-line">{{ good.refreshLabel }}</p>
    </div>
    <input
      :aria-label="countLabel"
      class="amount"
      :max="countMaximum"
      min="1"
      type="range"
      :value="pickedCount"
      @input="(event) => (count = Number((event.target as HTMLInputElement).value))"
    />
    <p class="amount-value">{{ pickedCount }}</p>
    <GameButton class="cancel" :aria-label="closeLabel" :kind="GameButtonKind.Row" tip="" @click="emit('close')">
      <svg class="cross" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6 18 18M18 6 6 18" />
      </svg>
    </GameButton>
    <GameButton
      class="buy"
      :disabled="countMaximum < 1"
      :kind="GameButtonKind.Row"
      tip=""
      @click="emit('buy', good, pickedCount)"
    >
      {{ buyLabel }}
    </GameButton>
  </div>
</template>

<style scoped>
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

<style scoped src="../../../styles/craftingShop.css"></style>

<style scoped src="../../../styles/shopScreen.css"></style>
