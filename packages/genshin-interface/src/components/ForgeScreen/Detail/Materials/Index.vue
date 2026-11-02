<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";
import { GAME_CREAM } from "#src/services/constants";

interface Props {
  // The amount slider's name for assistive tech, the game's "Amount" line
  amountLabel: string;
  // The amount the selected recipe forges, between one and the most its queue holds
  amountMaximum: number;
  // The refusal words the game shows in place of Start for an order past the day's forge points, or none
  refusalLabel: string;
  // The coins the selected recipe costs for its amount
  requiredCoins: number;
  // The Required line's label, the game's "Required", set over the coins
  requiredLabel: string;
  startLabel: string;
  // The total forge time for the amount, in the game's words
  totalTimeLabel: string;
}

const amount = defineModel<number>("amount");
const { amountLabel, amountMaximum, refusalLabel, requiredCoins, requiredLabel, startLabel, totalTimeLabel } =
  defineProps<Props>();
const emit = defineEmits<{ start: [] }>();
</script>

<template>
  <input v-model.number="amount" :aria-label="amountLabel" class="amount" :max="amountMaximum" min="1" type="range" />
  <p class="total-time">{{ totalTimeLabel }}</p>
  <p class="amount-label">{{ amountLabel }}</p>
  <span aria-hidden="true" class="amount-step amount-minus">−</span>
  <span class="amount-end amount-min">1</span>
  <span class="amount-end amount-max">{{ amountMaximum }}</span>
  <span aria-hidden="true" class="amount-step amount-plus">+</span>
  <p class="required-label">{{ requiredLabel }}</p>
  <p class="required">{{ requiredCoins }}</p>
  <GameButton v-if="!refusalLabel" class="action" :kind="GameButtonKind.Row" tip="" @click="emit('start')">
    {{ startLabel }}
  </GameButton>
  <p v-else class="refusal">{{ refusalLabel }}</p>
</template>

<style scoped>
.total-time {
  top: calc(var(--unit) * 146);
  left: 50%;
  translate: -50% 0;
  font-size: calc(var(--unit) * 27);
  line-height: 1;
  white-space: nowrap;
}
.amount {
  top: calc(var(--unit) * 590);
  left: calc(var(--unit) * 1368);
  width: calc(var(--unit) * 446);
  height: calc(var(--unit) * 20);
  accent-color: v-bind(GAME_CREAM);
}
/* The Required line: its label, then the coins the picked recipe costs, both on the line under the amount */
.required-label,
.required {
  top: calc(var(--unit) * 987);
  font-size: calc(var(--unit) * 24);
  line-height: 1;
}
.required-label {
  left: calc(var(--unit) * 1020);
}
.required {
  left: calc(var(--unit) * 1240);
}
.refusal {
  top: calc(var(--unit) * 963);
  left: calc(var(--unit) * 1560);
  width: calc(var(--unit) * 600);
  font-size: calc(var(--unit) * 24);
  line-height: 1;
  text-align: right;
}
.amount-label {
  top: calc(var(--unit) * 550);
  left: calc(var(--unit) * 1589.5);
  translate: -50% 0;
  color: v-bind(GAME_CREAM);
  font-size: calc(var(--unit) * 34);
  line-height: 1;
  white-space: nowrap;
}
.amount-end {
  top: calc(var(--unit) * 614.4);
  translate: -50% -50%;
  font-size: calc(var(--unit) * 26.8);
  line-height: 1;
}
.amount-min {
  left: calc(var(--unit) * 1318.9);
}
.amount-max {
  left: calc(var(--unit) * 1861.4);
}
.amount-step {
  top: calc(var(--unit) * 614.4);
  width: calc(var(--unit) * 48.8);
  height: calc(var(--unit) * 48.8);
  border-radius: 50%;
  background: color-mix(in srgb, v-bind(GAME_CREAM) 90%, transparent);
  color: #3b3b3b;
  font-size: calc(var(--unit) * 31.7);
  line-height: calc(var(--unit) * 48.8);
  text-align: center;
  translate: -50% -50%;
}
.amount-minus {
  left: calc(var(--unit) * 1249.4);
}
.amount-plus {
  left: calc(var(--unit) * 1928.4);
}
</style>

<style scoped src="../../../../styles/forgeDetail.css"></style>
