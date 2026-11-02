<script setup lang="ts">
import type { CurrencyCount } from "#src/models/CurrencyCount";

import { GAME_REPLY_HOVER_INK } from "#src/services/constants";

interface Props {
  // The counts the bag shows beside its tabs
  currencies: CurrencyCount[];
}

const { currencies } = defineProps<Props>();
</script>

<template>
  <ul class="currencies">
    <li v-for="{ id, isTopUp, name, quantity } of currencies" :key="id" class="currency" :data-currency="id">
      <span class="currency-name">{{ name }}</span>
      <span class="currency-icon" />
      {{ quantity }}
      <span v-if="isTopUp" class="top-up" />
    </li>
  </ul>
</template>

<style scoped>
/* The pills sit at the game's left edges, 40 units apart, their figures 19 units high in the game's face. The Primogem and Mora
   marks are drawn in the game's colours until the glyph pass traces them from the game's own icons */
.currencies {
  position: absolute;
  top: calc(var(--unit) * 1001);
  left: calc(var(--unit) * 139);
  display: flex;
  gap: calc(var(--unit) * 40);
  margin: 0;
  padding: 0;
  font-size: calc(var(--unit) * 29);
  font-weight: 600;
  list-style: none;
}

.currency {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 11);
  height: calc(var(--unit) * 38);
  padding: 0 calc(var(--unit) * 14);
  border-radius: calc(var(--unit) * 19);
  background: rgb(52 62 80 / 0.5);
}

.currency-icon {
  width: calc(var(--unit) * 27);
  height: calc(var(--unit) * 27);
}

/* Signika's figures run wider than the game's face at its height, so the Primogem's figures are set tighter to its width */
.currency[data-currency="Primogem"] {
  letter-spacing: calc(var(--unit) * -1.5);
}

.currency[data-currency="Primogem"] .currency-icon {
  width: calc(var(--unit) * 31);
  height: calc(var(--unit) * 31);
  clip-path: var(--sparkle-clip-path);
  background: linear-gradient(160deg, #d9f0ff, #7fb8ff 50%, #d6b3ff);
}

.currency[data-currency="Mora"] .currency-icon {
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 30);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff1a8, #e0a52c 55%, #a86f1a);
}

/* The top-up is a light disc with its plus, which overhangs the pill's end by a unit */
.top-up {
  position: relative;
  width: calc(var(--unit) * 32);
  height: calc(var(--unit) * 32);
  margin-left: calc(var(--unit) * 10);
  margin-right: calc(var(--unit) * -13);
  border-radius: 50%;
  background: #ece3d8;
}

.top-up::before,
.top-up::after {
  position: absolute;
  top: 50%;
  left: 50%;
  background: v-bind(GAME_REPLY_HOVER_INK);
  content: "";
  transform: translate(-50%, -50%);
}

.top-up::before {
  width: calc(var(--unit) * 16);
  height: calc(var(--unit) * 3);
}

.top-up::after {
  width: calc(var(--unit) * 3);
  height: calc(var(--unit) * 16);
}

.currency-name {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
</style>
