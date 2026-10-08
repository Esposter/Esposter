<script setup lang="ts">
import type { GameText } from "genshin-text";

import { HandbookTab } from "#src/models/handbook/HandbookTab";
import { HANDBOOK_TABS } from "#src/services/handbook/constants";
import { HandbookTabGameTextKeyMap } from "#src/services/handbook/HandbookTabGameTextKeyMap";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// The book opens at its experience
const tab = ref(HandbookTab.Experience);
</script>

<template>
  <!-- The Adventurer Handbook, which F1 opens: an open book with its tabs down the left edge and the open tab's pages
       Across it. Each tab's pages wait on the feature they track, so the book shows its tabs alone. Provisional: the
       Book's sizes, places and colours wait on the parity pass against the wiki's screenshot of the English client's -->
  <GameScreen class="handbook-screen">
    <div class="book">
      <div
        class="tabs"
        :aria-label="gameText[GameTextKey.AdventurerHandbook]"
        role="tablist"
        aria-orientation="vertical"
      >
        <button
          v-for="handbookTab of HANDBOOK_TABS"
          :key="handbookTab"
          class="tab"
          :aria-selected="tab === handbookTab"
          role="tab"
          type="button"
          @click="tab = handbookTab"
        >
          {{ gameText[HandbookTabGameTextKeyMap[handbookTab]] }}
        </button>
      </div>
      <div class="pages" :aria-label="gameText[HandbookTabGameTextKeyMap[tab]]" role="tabpanel" />
      <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">×</button>
    </div>
  </GameScreen>
</template>

<style scoped>
.handbook-screen {
  display: grid;
  background: #8e9aa5;
  place-items: center;
}

.book {
  position: relative;
  width: calc(var(--unit) * 1560);
  height: calc(var(--unit) * 860);
  border-radius: calc(var(--unit) * 16);
  background: #3b3f4a;
}

.tabs {
  position: absolute;
  top: calc(var(--unit) * 90);
  left: calc(var(--unit) * -40);
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 12);
}

.tab,
.close {
  border: none;
  cursor: inherit;
  font: inherit;
  font-weight: 600;
}

.tab {
  width: calc(var(--unit) * 170);
  height: calc(var(--unit) * 100);
  border-radius: calc(var(--unit) * 8) 0 0 calc(var(--unit) * 8);
  background: #4f6b7c;
  color: #fff;
  font-size: calc(var(--unit) * 26);
}

.tab[aria-selected="true"] {
  background: #f3efe4;
  color: #8a6c4a;
}

.pages {
  position: absolute;
  inset: calc(var(--unit) * 24) calc(var(--unit) * 24) calc(var(--unit) * 24) calc(var(--unit) * 150);
  border-radius: calc(var(--unit) * 8);
  background: #f3efe4;
}

.close {
  position: absolute;
  top: calc(var(--unit) * 40);
  right: calc(var(--unit) * -40);
  width: calc(var(--unit) * 80);
  height: calc(var(--unit) * 80);
  background: #3e5a73;
  color: #fff;
  font-size: calc(var(--unit) * 48);
  line-height: 1;
}
</style>
