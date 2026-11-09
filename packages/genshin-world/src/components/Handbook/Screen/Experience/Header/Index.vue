<script setup lang="ts">
import type { GameText } from "genshin-text";

import { CHECK_MARK_PATH } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

defineProps<Props>();
</script>

<template>
  <div class="chapter-checks" aria-hidden="true">
    <span v-for="index in 9" :key="index" class="chapter-check">
      <svg viewBox="0 0 252 228"><path :d="CHECK_MARK_PATH" /></svg>
    </span>
  </div>
  <div class="chapter-navigator">
    <span class="chapter-arrow" aria-hidden="true">
      <svg viewBox="0 0 29 50"><path d="M25 5L7 25l18 20" /></svg>
    </span>
    <p class="chapter-title" role="heading" aria-level="2">{{ gameText[GameTextKey.HandbookChapterNine] }}</p>
    <span class="chapter-arrow chapter-arrow-next" aria-hidden="true">
      <svg viewBox="0 0 29 50"><path d="M4 5l18 20L4 45" /></svg>
    </span>
  </div>
</template>

<style scoped>
/* The chapters' rings 96 apart on a line through their middles, each done chapter's tick in the game's own stroke
   overreaching its ring to the upper right. The current chapter's ornate ring is not drawn yet */
.chapter-checks {
  position: absolute;
  top: calc(var(--reference-pixel) * 165);
  left: calc(var(--reference-pixel) * 413);
  display: flex;
  gap: calc(var(--reference-pixel) * 41);
}

.chapter-checks::before {
  position: absolute;
  top: calc(50% - var(--reference-pixel) * 3);
  right: calc(var(--reference-pixel) * 27);
  left: calc(var(--reference-pixel) * 27);
  height: calc(var(--reference-pixel) * 6);
  background: #e1d6c7;
  content: "";
}

.chapter-check {
  position: relative;
  width: calc(var(--reference-pixel) * 55);
  height: calc(var(--reference-pixel) * 55);
  box-sizing: border-box;
  border: calc(var(--reference-pixel) * 4) solid #d3c6b5;
  border-radius: 50%;
  background: #ece4d6;
}

.chapter-check svg {
  position: absolute;
  top: calc(var(--reference-pixel) * -3);
  left: calc(var(--reference-pixel) * 2);
  width: calc(var(--reference-pixel) * 52);
  height: calc(var(--reference-pixel) * 47);
  fill: #b5a28b;
}

/* The chevrons centred 525 apart on the title's line, as the reference's measure, the way back a 108 disc and the way
   on, past the last chapter, an empty 78 ring with a faded chevron */
.chapter-navigator {
  position: absolute;
  top: calc(var(--reference-pixel) * 140);
  left: calc(var(--reference-pixel) * 2130);
  display: grid;
  width: calc(var(--reference-pixel) * 636);
  height: calc(var(--reference-pixel) * 108);
  align-items: center;
  grid-template-columns: calc(var(--reference-pixel) * 108) 1fr calc(var(--reference-pixel) * 108);
  justify-items: center;
}

.chapter-arrow {
  display: grid;
  width: calc(var(--reference-pixel) * 108);
  height: calc(var(--reference-pixel) * 108);
  box-sizing: border-box;
  border: calc(var(--reference-pixel) * 7) solid #e1dbd2;
  border-radius: 50%;
  background: #ebe6d7;
  place-items: center;
}

.chapter-arrow svg {
  width: calc(var(--reference-pixel) * 29);
  height: calc(var(--reference-pixel) * 50);
  fill: none;
  stroke: #3c4252;
  stroke-width: 11;
}

.chapter-arrow-next {
  width: calc(var(--reference-pixel) * 78);
  height: calc(var(--reference-pixel) * 78);
  border-width: calc(var(--reference-pixel) * 5);
  border-color: #ded6cd;
  background: none;
}

.chapter-arrow-next svg {
  stroke: #c3c1bd;
}

/* The game's face is wider than Signika, so the title is set 63 high and spaced 3 to take its width */
.chapter-title {
  margin: 0;
  color: #82603f;
  font-size: calc(var(--reference-pixel) * 63);
  font-weight: 600;
  letter-spacing: calc(var(--reference-pixel) * 3);
}
</style>
