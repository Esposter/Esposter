<script setup lang="ts">
import type { GameText } from "genshin-text";

import { QuestGlyph } from "#src/models/quest/QuestGlyph";
import { QuestGlyphMap } from "#src/services/quest/QuestGlyphMap";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The quest the button navigates to
  questId: string;
  // The quest being navigated to, "" with none
  trackedQuestId: string;
}

defineProps<Props>();
const emit = defineEmits<{ navigate: [questId: string] }>();
</script>

<template>
  <button class="quest-pill navigate cream-pill-button" type="button" @click="emit('navigate', questId)">
    <svg class="navigate-mark" aria-hidden="true" viewBox="0 0 32 32">
      <path
        v-for="(path, index) of QuestGlyphMap[QuestGlyph.ObjectiveRing].paths"
        :key="index"
        class="navigate-ring"
        :d="path"
      />
      <path v-for="(path, index) of QuestGlyphMap[QuestGlyph.ObjectiveCore].paths" :key="index" :d="path" />
    </svg>
    <span class="navigate-label">
      {{ gameText[questId === trackedQuestId ? GameTextKey.QuestCancelNavigation : GameTextKey.QuestNavigate] }}
    </span>
    <span class="navigate-key" aria-hidden="true">F</span>
  </button>
</template>

<style scoped src="genshin-interface/styles/creamPillButton.css"></style>
<style scoped src="../../../../../styles/questPill.css"></style>

<style scoped>
/* Its button 1512 across the screen, under the details */
.navigate {
  left: calc(var(--unit) * 635);
  isolation: isolate;
}

/* The objective's mark at 47 across, its ring grey round a dark core */
.navigate-mark {
  position: absolute;
  top: calc(var(--unit) * 5);
  left: calc(var(--unit) * 8);
  width: calc(var(--unit) * 47);
  height: calc(var(--unit) * 47);
  fill: #3b4250;
}

.navigate-ring {
  fill: #c0bdb5;
}

/* Centred 161 in from the pill's left, two lines 30 apart when it wraps. Narrowed to 190 so the stand-in font, narrower
   Than the game's, breaks Cancel Navigation where the game's does */
.navigate-label {
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(var(--unit) * 66);
  display: grid;
  width: calc(var(--unit) * 190);
  letter-spacing: calc(var(--unit) * 1.6);
  line-height: calc(var(--unit) * 30);
  place-items: center;
  text-align: center;
}

.navigate-key {
  position: absolute;
  top: calc(var(--unit) * 41);
  left: 0;
  display: grid;
  width: calc(var(--unit) * 19);
  height: calc(var(--unit) * 21);
  border-radius: calc(var(--unit) * 2);
  background: #f7f2ef;
  color: #433f3e;
  font-size: calc(var(--unit) * 16);
  place-items: center;
}
</style>
