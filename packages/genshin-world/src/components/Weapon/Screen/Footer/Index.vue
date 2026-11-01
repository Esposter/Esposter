<script setup lang="ts">
import type { GameText } from "genshin-text";

import { DIVIDER_OPACITY } from "#src/services/weapon/constants";
import { OrnamentDivider } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language, which the Required line's label is set in
  gameText: GameText;
  // The Mora the open tab's action spends, on the Required line
  pendingMora: number;
}

const { gameText, pendingMora } = defineProps<Props>();
</script>

<template>
  <div class="divider bottom-divider"><OrnamentDivider is-middle-hidden :opacity="DIVIDER_OPACITY" /></div>
  <p class="required-label">{{ gameText[GameTextKey.CraftingRequired] }}</p>
  <p class="required-amount">{{ pendingMora }}</p>
</template>

<style scoped>
.divider {
  position: absolute;
  left: calc(var(--reference-pixel) * 1086);
  width: calc(var(--reference-pixel) * 738);
}

.bottom-divider {
  top: calc(var(--reference-pixel) * 730);
}

.required-label,
.required-amount {
  position: absolute;
  margin: 0;
  font-weight: 600;
  line-height: 1;
}

.required-label {
  top: calc(var(--reference-pixel) * 791);
  left: calc(var(--reference-pixel) * 1107);
  color: #d6cabe;
  font-size: calc(var(--reference-pixel) * 28);
}

.required-amount {
  top: calc(var(--reference-pixel) * 789);
  left: calc(var(--reference-pixel) * 1275);
  color: #eee8f5;
  font-size: calc(var(--reference-pixel) * 24);
}

/* The gold coin beside the Required line's Mora */
.required-amount::before {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #fff7c8, #f7d25a 60%, #d9a53a);
  content: "";
}

.required-amount::before {
  top: calc(var(--reference-pixel) * 1);
  left: calc(var(--reference-pixel) * -45);
  width: calc(var(--reference-pixel) * 27);
  height: calc(var(--reference-pixel) * 27);
}
</style>
