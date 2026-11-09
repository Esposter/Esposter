<script setup lang="ts">
import type { Wallet } from "#src/models/inventory/Wallet";
import type { GameText } from "genshin-text";

import { Currency } from "#src/models/inventory/Currency";
import { ORIGINAL_RESIN_CAP } from "#src/services/originalResin/constants";
import { regenerateOriginalResin } from "#src/services/originalResin/regenerateOriginalResin";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The world's clock as the map shows it, which the Original Resin the top bar counts is read at
  now: Temporal.Instant;
  // The wallet, whose Original Resin the top bar counts as it regenerates to the moment the map opens
  wallet: Wallet;
}

const { now, wallet } = defineProps<Props>();
const originalResin = computed(() => regenerateOriginalResin(wallet, now)[Currency.OriginalResin]);
</script>

<template>
  <p class="resin">
    <span>{{ gameText[GameTextKey.OriginalResin] }}</span>
    <span>{{ originalResin }}/{{ ORIGINAL_RESIN_CAP }}</span>
  </p>
</template>

<style scoped>
/* Provisional: the resin counter's place, left of the close button, and its type, until a recording of the English PC
   client's map top bar measures them. It sits in a dark pill as the reference's top bar does, its middle level with the
   close button's */
.resin {
  position: absolute;
  top: calc(var(--unit) * 26);
  right: calc(var(--unit) * 130);
  display: flex;
  height: calc(var(--unit) * 44);
  box-sizing: border-box;
  align-items: center;
  gap: calc(var(--unit) * 14);
  margin: 0;
  padding: 0 calc(var(--unit) * 18);
  border-radius: calc(var(--unit) * 22);
  background: rgb(24 30 40 / 0.6);
  color: #ece5d7;
  font-size: calc(var(--unit) * 26);
}
</style>
