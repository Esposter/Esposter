<script setup lang="ts">
import type { HandbookReward } from "#src/models/handbook/HandbookReward";
import type { GameText } from "genshin-text";

import { ItemTile } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The panel's ring and bar: how many of its investigations are done out of how many
  completedCount: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The panel's rewards, in the game's order
  investigationRewards: HandbookReward[];
  // The panel's reward footer, shown once every reward is taken
  isRewardClaimed: boolean;
  totalCount: number;
}

const { completedCount, totalCount } = defineProps<Props>();
// The bar's segments, one per investigation, each lit when that investigation is done
const progressSegments = computed(() => Array.from({ length: totalCount }, (_value, index) => index < completedCount));
</script>

<template>
  <section class="panel" :aria-label="gameText[GameTextKey.HandbookInvestigationProgress]">
    <p class="panel-title">{{ gameText[GameTextKey.HandbookInvestigationProgress] }}</p>
    <div class="panel-ring">
      <span class="panel-count">{{ completedCount }}/{{ totalCount }}</span>
    </div>
    <div class="panel-bar">
      <span v-for="(isLit, index) of progressSegments" :key="index" class="panel-segment" :data-lit="isLit" />
    </div>
    <p class="panel-rewards-title">{{ gameText[GameTextKey.HandbookRewards] }}</p>
    <!-- Every count stands 42 reference pixels high, so its share of the tile is 42 over the tile's 188 or 141 -->
    <div class="panel-rewards">
      <ItemTile
        v-for="({ count, rarity }, index) of investigationRewards"
        :key="index"
        class="reward"
        count-size="22.34cqh"
        :count
        :rarity
      />
    </div>
    <p v-if="isRewardClaimed" class="panel-claimed">
      <span class="panel-claimed-mark" aria-hidden="true">✓</span>
      {{ gameText[GameTextKey.HandbookRewardsClaimed] }}
    </p>
  </section>
</template>

<style scoped>
.panel {
  position: absolute;
  top: calc(var(--reference-pixel) * 266);
  left: calc(var(--reference-pixel) * 399);
  width: calc(var(--reference-pixel) * 665);
  height: calc(var(--reference-pixel) * 1299);
  border: calc(var(--reference-pixel) * 3) solid #d8cbbc;
  border-radius: calc(var(--reference-pixel) * 6);
  background: #ece5db;
}

.panel-title {
  position: absolute;
  top: calc(var(--reference-pixel) * 51);
  left: calc(var(--reference-pixel) * -5);
  width: 100%;
  margin: 0;
  color: #81613f;
  font-size: calc(var(--reference-pixel) * 54);
  font-weight: 600;
  letter-spacing: calc(var(--reference-pixel) * 2);
  text-align: center;
}

.panel-ring {
  position: absolute;
  top: calc(var(--reference-pixel) * 154);
  left: calc(var(--reference-pixel) * 200);
  display: grid;
  width: calc(var(--reference-pixel) * 215);
  height: calc(var(--reference-pixel) * 215);
  border: calc(var(--reference-pixel) * 20) solid #dcd1c3;
  border-radius: 50%;
  background: #f1eae0;
  place-items: center;
}

.panel-count {
  color: #555554;
  font-size: calc(var(--reference-pixel) * 66);
  font-weight: 700;
  letter-spacing: calc(var(--reference-pixel) * -5);
}

/* Eleven segments on gaps of 12, spanning the reference's green bar from 432 to 1024 and from 723 to 748 */
.panel-bar {
  position: absolute;
  top: calc(var(--reference-pixel) * 455);
  left: calc(var(--reference-pixel) * 32);
  display: flex;
  width: calc(var(--reference-pixel) * 592);
  height: calc(var(--reference-pixel) * 28);
  gap: calc(var(--reference-pixel) * 12);
}

.panel-segment {
  flex: 1;
  background: #d9d2c0;
}

.panel-segment[data-lit="true"] {
  background: #a6d553;
}

.panel-rewards-title {
  position: absolute;
  top: calc(var(--reference-pixel) * 535);
  left: calc(var(--reference-pixel) * -4);
  width: 100%;
  margin: 0;
  color: #866645;
  font-size: calc(var(--reference-pixel) * 46);
  font-weight: 600;
  letter-spacing: calc(var(--reference-pixel) * 3);
  text-align: center;
}

.panel-rewards {
  position: absolute;
  top: calc(var(--reference-pixel) * 642);
  left: calc(var(--reference-pixel) * 23);
  display: grid;
  width: calc(var(--reference-pixel) * 620);
  grid-template-columns: repeat(3, calc(var(--reference-pixel) * 188));
  gap: calc(var(--reference-pixel) * 34) calc(var(--reference-pixel) * 23);
}

.reward {
  width: calc(var(--reference-pixel) * 188);
  height: calc(var(--reference-pixel) * 188);
}

.panel-claimed {
  position: absolute;
  top: calc(var(--reference-pixel) * 1197);
  left: 0;
  display: flex;
  width: 100%;
  margin: 0;
  align-items: center;
  justify-content: center;
  gap: calc(var(--reference-pixel) * 24);
  color: #8a6b4f;
  font-size: calc(var(--reference-pixel) * 46);
  font-weight: 600;
}

.panel-claimed-mark {
  display: grid;
  width: calc(var(--reference-pixel) * 57);
  height: calc(var(--reference-pixel) * 57);
  border-radius: 50%;
  background: #80cb43;
  color: #fff;
  font-size: calc(var(--reference-pixel) * 36);
  place-items: center;
}
</style>
