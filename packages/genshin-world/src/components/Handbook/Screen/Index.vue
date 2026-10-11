<script setup lang="ts">
import type { HandbookCommission } from "#src/models/handbook/HandbookCommission";
import type { HandbookReward } from "#src/models/handbook/HandbookReward";
import type { GameText } from "genshin-text";

import { HandbookTab } from "#src/models/handbook/HandbookTab";
import { COMMISSION_STEP, HANDBOOK_TABS } from "#src/services/handbook/constants";
import { HandbookTabGameTextKeyMap } from "#src/services/handbook/HandbookTabGameTextKeyMap";
import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The investigation's commissions, top to bottom
  commissions: HandbookCommission[];
  // The panel's ring and bar: how many of its investigations are done out of how many
  completedCount: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The panel's rewards, in the game's order
  investigationRewards: HandbookReward[];
  // The panel's reward footer, shown once every reward is taken
  isRewardClaimed?: true;
  totalCount: number;
}

const { commissions, completedCount, gameText, investigationRewards, totalCount } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
// The book opens at its experience
const tab = ref(HandbookTab.Experience);
// The bar's segments, one per investigation, each lit when that investigation is done
const progressSegments = computed(() => Array.from({ length: totalCount }, (_value, index) => index < completedCount));
</script>

<template>
  <!-- The Adventurer Handbook, which F1 opens: an open book whose tabs run down its left edge and whose Experience page
       Shows the chapter's investigations. Every box is measured from the English client's wiki screenshot at 1080 high,
       one reference pixel per 0.6243 units, so each piece lands where the game draws it at any window size -->
  <GameScreen class="handbook-screen">
    <div class="frame">
      <div class="book" />
      <div class="pages" />
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
      <div class="chapter-checks" aria-hidden="true">
        <span v-for="index in 9" :key="index" class="chapter-check">
          <svg viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9" /></svg>
        </span>
      </div>
      <div class="chapter-navigator">
        <span class="chapter-arrow chapter-arrow-previous" aria-hidden="true">‹</span>
        <p class="chapter-title" role="heading" aria-level="2">{{ gameText[GameTextKey.HandbookChapterNine] }}</p>
        <span class="chapter-arrow chapter-arrow-next" aria-hidden="true">›</span>
      </div>
      <section class="panel" :aria-label="gameText[GameTextKey.HandbookInvestigationProgress]">
        <p class="panel-title">{{ gameText[GameTextKey.HandbookInvestigationProgress] }}</p>
        <div class="panel-ring">
          <span class="panel-count">{{ completedCount }}/{{ totalCount }}</span>
        </div>
        <div class="panel-bar">
          <span v-for="(isLit, index) of progressSegments" :key="index" class="panel-segment" :data-lit="isLit" />
        </div>
        <p class="panel-rewards-title">{{ gameText[GameTextKey.HandbookRewards] }}</p>
        <div class="panel-rewards">
          <span v-for="(reward, index) of investigationRewards" :key="index" class="reward" :data-tone="reward.tone">
            <span class="reward-count">{{ reward.count }}</span>
          </span>
        </div>
        <p v-if="isRewardClaimed" class="panel-claimed">
          <span class="panel-claimed-mark" aria-hidden="true">✓</span>
          {{ gameText[GameTextKey.HandbookRewardsClaimed] }}
        </p>
      </section>
      <ol class="commissions" :aria-label="gameText[HandbookTabGameTextKeyMap[HandbookTab.Experience]]">
        <li
          v-for="(commission, index) of commissions"
          :key="index"
          class="commission"
          :style="{ top: `calc(var(--reference-pixel) * ${index * COMMISSION_STEP})` }"
        >
          <p class="commission-title">{{ gameText[commission.titleKey] }}</p>
          <p class="commission-progress">{{ commission.progress }}/{{ commission.total }}</p>
          <span
            v-for="(reward, rewardIndex) of commission.rewards"
            :key="rewardIndex"
            class="commission-reward"
            :data-tone="reward.tone"
            :style="{ left: `calc(var(--reference-pixel) * ${1018 + rewardIndex * 159})` }"
          >
            <span class="reward-count">{{ reward.count }}</span>
          </span>
          <svg class="commission-check" viewBox="0 0 252 228" aria-hidden="true">
            <path
              fill="#5aa02c"
              fill-rule="evenodd"
              d="M 237.5 26 Q 242.75 24.25 241 29.5 L 235 40.5 L 230 45.5 L 226 52.5 L 222 56.5 L 213 70.5 L 210 73.5 L 209 76.5 L 205 80.5 L 204 83.5 L 192 100.5 L 185 112.5 L 176 123.5 L 171 132.5 L 157 151.5 L 156 154.5 L 152 158.5 L 145 170.5 L 137 180.5 L 136 183.5 L 132 187.5 L 130 192.5 L 127 195.5 L 127 197.5 L 123.5 202 L 117.5 204 L 106.5 198 L 104 195.5 L 100.5 191 L 84.5 180 L 71 167.5 Q 69.75 161.75 65.5 159 L 58.5 157 L 53.5 154 L 40.5 142 L 32.5 139 L 26.5 139 L 23.5 138 L 21 135.5 L 21 133.5 L 24 127.5 L 50.5 91 L 55.5 88 L 60.5 88 L 66 92.5 Q 65.25 94.75 67.5 94 L 84 111.5 L 85 114.5 L 98 127.5 L 103.5 137 L 110.5 138 L 128.5 125 L 140.5 113 L 161.5 95 L 171.5 85 L 179.5 79 L 199 60.5 L 201.5 57 L 213.5 48 Q 224.35 35.85 237.5 26 Z"
            />
          </svg>
        </li>
      </ol>
      <div class="ribbon">
        <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">×</button>
      </div>
    </div>
  </GameScreen>
</template>

<style scoped>
.handbook-screen {
  --reference-pixel: calc(var(--unit) * 0.62428);

  display: grid;
  background: #8e9aa5;
  place-items: center;
  overflow: visible;
}

/* The reference frame, 3130 by 1730 reference pixels, every piece placed inside it at its measured box */
.frame {
  position: relative;
  width: calc(var(--reference-pixel) * 3130);
  height: calc(var(--reference-pixel) * 1730);
}

.book {
  position: absolute;
  top: calc(var(--reference-pixel) * 55);
  left: calc(var(--reference-pixel) * 274);
  width: calc(var(--reference-pixel) * 2676);
  height: calc(var(--reference-pixel) * 1620);
  border-radius: calc(var(--reference-pixel) * 40);
  background: #26262e;
}

.pages {
  position: absolute;
  top: calc(var(--reference-pixel) * 94);
  left: calc(var(--reference-pixel) * 337);
  width: calc(var(--reference-pixel) * 2543);
  height: calc(var(--reference-pixel) * 1534);
  border-radius: calc(var(--reference-pixel) * 12);
  background: #efe8d8;
}

.tabs {
  position: absolute;
  top: calc(var(--reference-pixel) * 185);
  left: calc(var(--reference-pixel) * 67);
  width: calc(var(--reference-pixel) * 265);
  height: calc(var(--reference-pixel) * 1200);
}

.tab {
  position: absolute;
  left: 0;
  width: calc(var(--reference-pixel) * 265);
  height: calc(var(--reference-pixel) * 172);
  border: none;
  border-radius: calc(var(--reference-pixel) * 14) 0 0 calc(var(--reference-pixel) * 14);
  color: #fff;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--reference-pixel) * 48);
  font-weight: 600;
}

.tab:nth-child(1) {
  top: 0;
  background: #efe8d8;
  color: #8a5a2b;
}

.tab:nth-child(2) {
  top: calc(var(--reference-pixel) * 199);
  background: #6b4c9e;
}

.tab:nth-child(3) {
  top: calc(var(--reference-pixel) * 402);
  background: #2f7f8e;
}

.tab:nth-child(4) {
  top: calc(var(--reference-pixel) * 605);
  background: #a24f42;
}

.tab:nth-child(5) {
  top: calc(var(--reference-pixel) * 807);
  background: #c8912f;
}

.tab:nth-child(6) {
  top: calc(var(--reference-pixel) * 1005);
  background: #2e8c86;
}

.chapter-checks {
  position: absolute;
  top: calc(var(--reference-pixel) * 163);
  left: calc(var(--reference-pixel) * 412);
  display: flex;
  gap: calc(var(--reference-pixel) * 40);
}

.chapter-check {
  display: grid;
  width: calc(var(--reference-pixel) * 56);
  height: calc(var(--reference-pixel) * 56);
  border: calc(var(--reference-pixel) * 4) solid #b8ad96;
  border-radius: 50%;
  background: #f7f2e6;
  place-items: center;
}

.chapter-check svg {
  width: 70%;
  height: 70%;
  fill: none;
  stroke: #8f8470;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chapter-navigator {
  position: absolute;
  top: calc(var(--reference-pixel) * 147);
  left: calc(var(--reference-pixel) * 2143);
  display: flex;
  width: calc(var(--reference-pixel) * 600);
  align-items: center;
  justify-content: space-between;
}

.chapter-arrow {
  display: grid;
  width: calc(var(--reference-pixel) * 88);
  height: calc(var(--reference-pixel) * 88);
  border-radius: 50%;
  background: #f7f2e6;
  color: #7c5530;
  font-size: calc(var(--reference-pixel) * 64);
  line-height: 1;
  place-items: center;
}

.chapter-arrow-next {
  color: #c7bba3;
}

.chapter-title {
  margin: 0;
  color: #7a4e2a;
  font-size: calc(var(--reference-pixel) * 72);
  font-weight: 600;
}

.panel {
  position: absolute;
  top: calc(var(--reference-pixel) * 266);
  left: calc(var(--reference-pixel) * 399);
  width: calc(var(--reference-pixel) * 665);
  height: calc(var(--reference-pixel) * 1299);
  border: calc(var(--reference-pixel) * 3) solid #cbbf9f;
  border-radius: calc(var(--reference-pixel) * 6);
  background: #f5efe2;
}

.panel-title {
  position: absolute;
  top: calc(var(--reference-pixel) * 62);
  left: 0;
  width: 100%;
  margin: 0;
  color: #5b4730;
  font-size: calc(var(--reference-pixel) * 46);
  font-weight: 600;
  text-align: center;
}

.panel-ring {
  position: absolute;
  top: calc(var(--reference-pixel) * 170);
  left: calc(var(--reference-pixel) * 219);
  display: grid;
  width: calc(var(--reference-pixel) * 220);
  height: calc(var(--reference-pixel) * 220);
  border: calc(var(--reference-pixel) * 10) solid #e6dccb;
  border-radius: 50%;
  background: #fbf8f1;
  place-items: center;
}

.panel-count {
  color: #4b4234;
  font-size: calc(var(--reference-pixel) * 100);
  font-weight: 700;
}

.panel-bar {
  position: absolute;
  top: calc(var(--reference-pixel) * 454);
  left: calc(var(--reference-pixel) * 31);
  display: flex;
  width: calc(var(--reference-pixel) * 595);
  height: calc(var(--reference-pixel) * 28);
  gap: calc(var(--reference-pixel) * 8);
}

.panel-segment {
  flex: 1;
  background: #d9d2c0;
}

.panel-segment[data-lit="true"] {
  background: #7cc242;
}

.panel-rewards-title {
  position: absolute;
  top: calc(var(--reference-pixel) * 540);
  left: 0;
  width: 100%;
  margin: 0;
  color: #7a5a3a;
  font-size: calc(var(--reference-pixel) * 40);
  font-weight: 600;
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
  position: relative;
  display: flex;
  width: calc(var(--reference-pixel) * 188);
  height: calc(var(--reference-pixel) * 188);
  align-items: flex-end;
  justify-content: center;
  background: #e09a48;
}

.reward[data-tone="Book"] {
  background: #6b4c9e;
}

.reward-count {
  width: 100%;
  padding: calc(var(--reference-pixel) * 6) 0;
  background: rgb(0 0 0 / 35%);
  color: #fff;
  font-size: calc(var(--reference-pixel) * 40);
  font-weight: 700;
  text-align: center;
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
  gap: calc(var(--reference-pixel) * 20);
  color: #5b4730;
  font-size: calc(var(--reference-pixel) * 46);
  font-weight: 600;
}

.panel-claimed-mark {
  display: grid;
  width: calc(var(--reference-pixel) * 56);
  height: calc(var(--reference-pixel) * 56);
  border-radius: 50%;
  background: #5aa02c;
  color: #fff;
  font-size: calc(var(--reference-pixel) * 36);
  place-items: center;
}

.commissions {
  position: absolute;
  top: calc(var(--reference-pixel) * 318);
  left: calc(var(--reference-pixel) * 1121);
  width: calc(var(--reference-pixel) * 1670);
  height: calc(var(--reference-pixel) * 1230);
  margin: 0;
  padding: 0;
  list-style: none;
}

.commission {
  position: absolute;
  left: 0;
  width: calc(var(--reference-pixel) * 1670);
  height: calc(var(--reference-pixel) * 236);
  border-top: calc(var(--reference-pixel) * 2) solid #d9cfb8;
  background: #f2ecdf;
}

.commission-title {
  position: absolute;
  top: calc(var(--reference-pixel) * 40);
  left: calc(var(--reference-pixel) * 259);
  width: calc(var(--reference-pixel) * 720);
  margin: 0;
  color: #4f3f2a;
  font-size: calc(var(--reference-pixel) * 56);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 60);
}

.commission-progress {
  position: absolute;
  top: calc(var(--reference-pixel) * 157);
  left: calc(var(--reference-pixel) * 266);
  height: calc(var(--reference-pixel) * 41);
  margin: 0;
  padding: 0 calc(var(--reference-pixel) * 20);
  border-radius: calc(var(--reference-pixel) * 21);
  background: #e6dccb;
  color: #7a5a3a;
  font-size: calc(var(--reference-pixel) * 40);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 41);
}

.commission-reward {
  position: absolute;
  top: calc(var(--reference-pixel) * 50);
  display: flex;
  width: calc(var(--reference-pixel) * 141);
  height: calc(var(--reference-pixel) * 138);
  align-items: flex-end;
  justify-content: center;
  background: #e09a48;
}

.commission-reward[data-tone="Book"] {
  background: #6b4c9e;
}

.commission-reward .reward-count {
  font-size: calc(var(--reference-pixel) * 36);
}

.commission-check {
  position: absolute;
  top: calc(var(--reference-pixel) * 80);
  left: calc(var(--reference-pixel) * 1467);
  width: calc(var(--reference-pixel) * 84);
  height: calc(var(--reference-pixel) * 76);
}

.ribbon {
  position: absolute;
  top: calc(var(--reference-pixel) * 185);
  left: calc(var(--reference-pixel) * 2888);
  display: grid;
  width: calc(var(--reference-pixel) * 162);
  height: calc(var(--reference-pixel) * 141);
  background: #3a6ea5;
  place-items: center;
}

.close {
  border: none;
  background: transparent;
  color: #fff;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--reference-pixel) * 96);
  line-height: 1;
}
</style>
