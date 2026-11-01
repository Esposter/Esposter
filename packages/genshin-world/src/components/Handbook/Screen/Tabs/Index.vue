<script setup lang="ts">
import type { HandbookTab } from "#src/models/handbook/HandbookTab";
import type { GameText } from "genshin-text";

import { HANDBOOK_TABS } from "#src/services/handbook/constants";
import { HandbookTabGameTextKeyMap } from "#src/services/handbook/HandbookTabGameTextKeyMap";
import { GAME_ROW_HOVER, GAME_ROW_PRESS } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

const tab = defineModel<HandbookTab>("tab", { required: true });
const { gameText } = defineProps<Props>();
// Each tab with its label in the reader's language
const tabs = computed(() =>
  HANDBOOK_TABS.map((handbookTab) => ({ handbookTab, label: gameText[HandbookTabGameTextKeyMap[handbookTab]] })),
);
</script>

<template>
  <div class="tabs" :aria-label="gameText[GameTextKey.AdventurerHandbook]" role="tablist" aria-orientation="vertical">
    <button
      v-for="{ handbookTab, label } of tabs"
      :key="handbookTab"
      class="tab"
      :aria-selected="tab === handbookTab"
      role="tab"
      :style="{ '--label-length': label.length }"
      type="button"
      @click="tab = handbookTab"
    >
      {{ label }}
    </button>
  </div>
</template>

<style scoped src="../../../../styles/tabTint.css"></style>

<style scoped>
.tabs {
  position: absolute;
  top: calc(var(--reference-pixel) * 185);
  left: calc(var(--reference-pixel) * 67);
  width: calc(var(--reference-pixel) * 265);
  height: calc(var(--reference-pixel) * 1200);
  --tab-hover: v-bind(GAME_ROW_HOVER);
  --tab-press: v-bind(GAME_ROW_PRESS);
}

.tab {
  position: absolute;
  left: 0;
  width: calc(var(--reference-pixel) * 265);
  height: calc(var(--reference-pixel) * 172);
  border: none;
  border-radius: calc(var(--reference-pixel) * 14);
  color: #f6ecdb;
  cursor: inherit;
  font: inherit;
  font-size: min(calc(var(--reference-pixel) * 56), calc(var(--reference-pixel) * 560 / var(--label-length)));
  font-weight: 600;
  letter-spacing: calc(var(--reference-pixel) * 2.5);
}

/* The game shrinks a label to its tab's width. The label's length in letters stands in for its width: an estimate that holds
   the English client's six, not a wider script's. Commissions is the one it misses, so it is set to 41 as the game draws it */
.tab:nth-child(1) {
  top: 0;
  left: calc(var(--reference-pixel) * -15);
  width: calc(var(--reference-pixel) * 315);
  padding-left: calc(var(--reference-pixel) * 22);
  background: #e9e2d7;
  box-shadow: inset calc(var(--reference-pixel) * 16) 0 0 #82ab59;
  color: #876649;
}

.tab:nth-child(2) {
  top: calc(var(--reference-pixel) * 199);
  background: #544470;
  font-size: calc(var(--reference-pixel) * 41);
}

.tab:nth-child(3) {
  top: calc(var(--reference-pixel) * 402);
  background: #2d5e71;
}

.tab:nth-child(4) {
  top: calc(var(--reference-pixel) * 605);
  background: #6a3f35;
}

.tab:nth-child(5) {
  top: calc(var(--reference-pixel) * 807);
  background: #7e5a28;
}

.tab:nth-child(6) {
  top: calc(var(--reference-pixel) * 1005);
  background: #2a6d6d;
}
</style>
