<script setup lang="ts">
import type { HandbookCommission } from "#src/models/handbook/HandbookCommission";
import type { GameText } from "genshin-text";

import { toCommissionRowTop } from "#src/services/handbook/toCommissionRowTop";
import { CHECK_MARK_PATH, ItemTile } from "genshin-interface";

interface Props {
  // The commission this row shows
  commission: HandbookCommission;
  // The game's words in the reader's language
  gameText: GameText;
  // The row's place in the list, top to bottom, which sets how far down it stands
  index: number;
}

const { commission, gameText, index } = defineProps<Props>();
</script>

<template>
  <li class="commission handbook-card" :style="{ top: toCommissionRowTop(index) }">
    <div class="commission-text">
      <p class="commission-title">{{ gameText[commission.titleKey] }}</p>
      <p class="commission-progress">{{ commission.progress }}/{{ commission.total }}</p>
    </div>
    <ItemTile
      v-for="({ count, rarity }, rewardIndex) of commission.rewards"
      :key="rewardIndex"
      class="commission-reward"
      count-size="29.79cqh"
      :count
      :rarity
      :style="{ left: `calc(var(--reference-pixel) * ${1020 + rewardIndex * 159})` }"
    />
    <svg class="commission-check" viewBox="0 0 252 228" aria-hidden="true">
      <path fill-rule="evenodd" :d="CHECK_MARK_PATH" />
    </svg>
  </li>
</template>

<style scoped src="../../../../../styles/handbookCards.css"></style>

<style scoped>
.commission-reward {
  position: absolute;
  top: calc(var(--reference-pixel) * 50);
  width: calc(var(--reference-pixel) * 141);
  height: calc(var(--reference-pixel) * 141);
}
</style>
