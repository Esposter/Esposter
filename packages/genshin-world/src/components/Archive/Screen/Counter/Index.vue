<script setup lang="ts">
import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { GameText } from "genshin-text";

import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The entries the player has met, by section
  progressMap: ArchiveProgress;
}

const { gameText, progressMap } = defineProps<Props>();
// The Archive's count is every section's open entries, which the game fills into its counter's first value
const unlockedCountSegments = computed(() =>
  splitGameTextColors(
    fillGameTextValues(
      gameText[GameTextKey.ArchiveUnlockedEntriesCount],
      [...progressMap.values()].reduce((count, entryIds) => count + entryIds.size, 0),
    ),
  ),
);
</script>

<template>
  <p class="counter">
    <span>{{ gameText[GameTextKey.ArchiveUnlockedEntries] }}</span>
    <span class="count"
      ><span v-for="({ color, text }, index) of unlockedCountSegments" :key="index" :style="{ color }">{{
        text
      }}</span></span
    >
  </p>
</template>

<style scoped>
.counter {
  position: absolute;
  top: calc(var(--unit) * 31);
  right: calc(var(--unit) * 140);
  margin: 0;
  color: #d3c79f;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 30);
  letter-spacing: calc(var(--unit) * 0.1);
  white-space: nowrap;
}

/* The count sits a space past its label, as the game sets the two apart */
.count {
  margin-inline-start: calc(var(--unit) * 7);
  color: #e6e6e0;
}
</style>
