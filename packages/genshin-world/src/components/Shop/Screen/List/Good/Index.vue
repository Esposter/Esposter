<script setup lang="ts">
import type { ShopGoodCell } from "genshin-interface";

import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The good the row offers, with its name, its limit and the costs it is paid in
  good: ShopGoodCell;
  // Whether the row is the good the detail shows, which draws it lit and reads it as pressed
  isPicked: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ pick: [] }>();
</script>

<template>
  <GameButton class="good" :aria-pressed="isPicked" :kind="GameButtonKind.Row" tip="" @click="emit('pick')">
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
</template>

<style scoped src="genshin-interface/styles/shopScreen.css"></style>

<style scoped>
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
</style>
