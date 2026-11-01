<script setup lang="ts">
import type { QuestChapter } from "#src/models/quest/QuestChapter";
import type { GameText } from "genshin-text";

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
    <li v-for="{ count, itemId, rarity } of chapter.rewards" :key="itemId" class="reward" :data-rarity="rarity">
      <span class="reward-count">{{ count }}</span>
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

/* A tile shaded by its item's rarity, three stars and under in blue, four in purple and five in gold, its count on a
   Band along its foot */
.reward {
  position: relative;
  width: calc(var(--unit) * 94);
  height: calc(var(--unit) * 94);
  overflow: hidden;
  border-radius: calc(var(--unit) * 6);
  background: linear-gradient(#5a698f, #5482aa);
}

.reward[data-rarity="4"] {
  background: linear-gradient(#666094, #8870b3);
}

.reward[data-rarity="5"] {
  background: linear-gradient(#9e6a3c, #ba7831);
}

.reward-count {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: calc(var(--unit) * 23);
  background: rgb(70 82 101 / 0.73);
  color: #fff;
  font-size: calc(var(--unit) * 20);
  font-weight: 600;
  line-height: calc(var(--unit) * 23);
  text-align: center;
}
</style>
