<script setup lang="ts">
import type { QuestChapter } from "#src/models/quest/QuestChapter";
import type { GameText } from "genshin-text";

import { ItemTile } from "genshin-interface";
import { GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The series whose rewards the pane lists
  chapter: QuestChapter;
  // The game's words in the reader's language
  gameText: GameText;
}

const { chapter, gameText } = defineProps<Props>();
// The caption over a series' rewards, its journal's name in the game's gold
const rewardsCaptionSegments = computed(() => splitGameTextColors(gameText[GameTextKey.QuestSeriesRewards]));
</script>

<template>
  <span class="lower-divider" />
  <p class="rewards-caption">
    <span v-for="({ color, text }, index) of rewardsCaptionSegments" :key="index" :style="{ color }">{{ text }}</span>
  </p>
  <ul class="rewards">
    <li v-for="{ count, itemId, rarity } of chapter.rewards" :key="itemId" class="reward">
      <ItemTile class="reward-tile" count-size="21.28cqh" :count :rarity variant="quest" />
    </li>
  </ul>
</template>

<style scoped>
.lower-divider {
  position: absolute;
  height: calc(var(--unit) * 2);
  top: calc(var(--unit) * 773);
  left: 0;
  width: 100%;
  background: rgb(255 255 255 / 0.06);
}

/* Its capitals' tops at 792.9, 15.6 high in the still, its line's left at the details' own. Letter-spaced a unit, the
   stand-in face runs about 18 units past the still's line end, and the spacing that lands the end raised the mean */
.rewards-caption {
  position: absolute;
  top: calc(var(--unit) * 790.8);
  left: calc(var(--unit) * 1);
  margin: 0;
  color: #ece7de;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1);
  line-height: calc(var(--unit) * 22);
  white-space: nowrap;
}

.rewards {
  position: absolute;
  top: calc(var(--unit) * 831);
  left: calc(var(--unit) * 1);
  display: flex;
  gap: calc(var(--unit) * 16.5);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Each reward is the shared item tile in the quest's look, its box the reward's 94 units, its count 20 units high */
.reward {
  display: flex;
  width: calc(var(--unit) * 94);
  height: calc(var(--unit) * 94);
}

.reward-tile {
  width: 100%;
  height: 100%;
}
</style>
