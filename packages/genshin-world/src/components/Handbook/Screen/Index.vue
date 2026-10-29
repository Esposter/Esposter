<script setup lang="ts">
import type { HandbookCommission } from "#src/models/handbook/HandbookCommission";
import type { HandbookDayCommission } from "#src/models/handbook/HandbookDayCommission";
import type { HandbookDomain } from "#src/models/handbook/HandbookDomain";
import type { HandbookReward } from "#src/models/handbook/HandbookReward";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { GameText } from "genshin-text";

import { HandbookTab } from "#src/models/handbook/HandbookTab";
import { COMMISSION_STEP, HANDBOOK_TABS } from "#src/services/handbook/constants";
import { HandbookTabGameTextKeyMap } from "#src/services/handbook/HandbookTabGameTextKeyMap";
import { CHECK_MARK_PATH, GameScreen, ItemTile } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // Whether a Long-Term Encounter Point can be converted now, so its button is enabled
  canUseLongTermEncounterPoints: boolean;
  // The investigation's commissions, top to bottom
  commissions: HandbookCommission[];
  // The panel's ring and bar: how many of its investigations are done out of how many
  completedCount: number;
  // The day's four commissions, top to bottom, as the Commissions tab lists them
  dayCommissions: HandbookDayCommission[];
  // The Domains tab's rows, top to bottom: each domain with the one action the player can take with it
  domains: HandbookDomain[];
  // The most daily Encounter Points the storage holds, in whole points, which the panel's count reads against
  encounterPointLimit: number;
  // The daily Encounter Points held, as whole points, which the panel's count shows
  encounterPoints: number;
  // The game's words in the reader's language
  gameText: GameText;
  // The panel's rewards, in the game's order
  investigationRewards: HandbookReward[];
  // Whether the Adventure Encounters panel is open at the player's Adventure Rank, so its stage rewards show
  isAdventureEncountersUnlocked: boolean;
  // The panel's reward footer, shown once every reward is taken
  isRewardClaimed: boolean;
  // The Long-Term Encounter Points held, as whole points, which the Commissions tab's stage rewards count
  longTermEncounterPoints: number;
  // The names the commissions' titles cite, by their name text id, in the reader's language
  nameText: Readonly<Record<string, string>>;
  totalCount: number;
}

const {
  canUseLongTermEncounterPoints,
  commissions,
  completedCount,
  dayCommissions,
  domains,
  encounterPointLimit,
  encounterPoints,
  gameText,
  investigationRewards,
  isAdventureEncountersUnlocked,
  longTermEncounterPoints,
  nameText,
  totalCount,
} = defineProps<Props>();
// A locked weekly boss is challenged by its entrance, and a weekly boss's first clear is claimed by its entry
const emit = defineEmits<{
  challenge: [landmark: DomainEntranceLandmark];
  claimCommission: [commissionId: number];
  claimFirstClear: [entryId: number];
  close: [];
  useLongTermEncounterPoints: [];
}>();
// The book opens at its experience
const tab = ref(HandbookTab.Experience);
// Each tab with its label in the reader's language
const tabs = computed(() =>
  HANDBOOK_TABS.map((handbookTab) => ({ handbookTab, label: gameText[HandbookTabGameTextKeyMap[handbookTab]] })),
);
// The bar's segments, one per investigation, each lit when that investigation is done
const progressSegments = computed(() => Array.from({ length: totalCount }, (_value, index) => index < completedCount));
</script>

<template>
  <!-- The Adventurer Handbook, which F1 opens: an open book whose tabs run down its left edge and whose Experience page
       shows the chapter's investigations. Every box is measured from the English client's wiki screenshot at 1080 high,
       one reference pixel per 0.6243 units, so each piece lands where the game draws it at any window size -->
  <GameScreen class="handbook-screen">
    <div class="frame">
      <div class="book" />
      <div class="stack stack-left" />
      <div class="stack stack-right" />
      <div class="pages" />
      <div
        class="tabs"
        :aria-label="gameText[GameTextKey.AdventurerHandbook]"
        role="tablist"
        aria-orientation="vertical"
      >
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
      <template v-if="tab === HandbookTab.Experience">
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
        <ol class="commissions handbook-list" :aria-label="gameText[HandbookTabGameTextKeyMap[HandbookTab.Experience]]">
          <li
            v-for="(commission, index) of commissions"
            :key="index"
            class="commission handbook-card"
            :style="{ top: `calc(var(--reference-pixel) * ${index * COMMISSION_STEP})` }"
          >
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
        </ol>
      </template>
      <ol
        v-else-if="tab === HandbookTab.Commissions"
        class="commissions handbook-list"
        :aria-label="gameText[HandbookTabGameTextKeyMap[HandbookTab.Commissions]]"
      >
        <li
          v-for="(commission, index) of dayCommissions"
          :key="index"
          class="commission handbook-card"
          :style="{ top: `calc(var(--reference-pixel) * ${index * COMMISSION_STEP})` }"
        >
          <div class="commission-text">
            <p class="commission-title">{{ nameText[commission.nameTextId] }}</p>
            <p class="commission-progress">{{ commission.progress }}/{{ commission.total }}</p>
          </div>
          <p v-if="commission.regionTextKey" class="commission-region">{{ gameText[commission.regionTextKey] }}</p>
          <button
            v-if="commission.isClaimable"
            class="commission-claim"
            type="button"
            @click="emit('claimCommission', commission.commissionId)"
          >
            {{ gameText[GameTextKey.ClaimRewards] }}
          </button>
          <svg v-else-if="commission.isClaimed" class="commission-check" viewBox="0 0 252 228" aria-hidden="true">
            <path fill-rule="evenodd" :d="CHECK_MARK_PATH" />
          </svg>
        </li>
        <!-- The Encounter Points stage rewards at the foot of the tab, where the game keeps the Long-Term Encounter Points -->
        <li v-if="isAdventureEncountersUnlocked" class="encounter-points">
          <p class="encounter-points-title">{{ gameText[GameTextKey.AdventureEncounterRewards] }}</p>
          <!-- The daily points held over the storage's limit. The dump has no label for this count, so it stands bare until a recording measures the panel -->
          <p class="encounter-points-daily">{{ encounterPoints }}/{{ encounterPointLimit }}</p>
          <p class="encounter-points-stored">
            {{ gameText[GameTextKey.LongTermEncounterPointsStored] }}
            <span>{{ longTermEncounterPoints }}</span>
          </p>
          <button
            class="encounter-points-use"
            :disabled="!canUseLongTermEncounterPoints"
            type="button"
            @click="emit('useLongTermEncounterPoints')"
          >
            {{ gameText[GameTextKey.UseLongTermEncounterPoints] }}
          </button>
        </li>
      </ol>
      <ol
        v-else-if="tab === HandbookTab.Domains"
        class="domains handbook-list"
        :aria-label="gameText[HandbookTabGameTextKeyMap[HandbookTab.Domains]]"
      >
        <li v-for="domain of domains" :key="domain.entryId" class="domain handbook-card">
          <p class="domain-title">{{ gameText[domain.titleTextKey] }}</p>
          <button
            v-if="domain.isQuickChallengeable"
            class="domain-action"
            type="button"
            @click="emit('challenge', domain.landmark)"
          >
            {{ gameText[GameTextKey.BossQuickChallenge] }}
          </button>
          <button
            v-if="domain.isFirstClearClaimable"
            class="domain-action"
            type="button"
            @click="emit('claimFirstClear', domain.entryId)"
          >
            {{ gameText[GameTextKey.ClaimRewards] }}
          </button>
        </li>
      </ol>
      <div class="feather" />
      <div class="ribbon">
        <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">
          <svg viewBox="0 0 67 67" aria-hidden="true">
            <path d="M0 0h25L0 25zM67 0v25L42 0zM67 67H42l25-25zM0 67V42l25 25z" />
            <path d="M8 8l51 51M59 8L8 59" stroke-width="13" />
          </svg>
        </button>
      </div>
    </div>
  </GameScreen>
</template>

<style scoped>
.handbook-screen {
  --reference-pixel: calc(var(--unit) * 0.62428);

  display: grid;
  background: #879190;
  place-items: center;
  overflow: visible;
}

/* The reference frame, 3130 by 1730 reference pixels, every piece placed inside it at its measured box */
.frame {
  position: relative;
  width: calc(var(--reference-pixel) * 3130);
  height: calc(var(--reference-pixel) * 1730);
  /* The scene behind the book, blurred: lighter to the lower left and darker to the upper right, a straight run between
     the measured corners, which misses the upper left by about nine levels */
  background: linear-gradient(to bottom left, #777e7d, #909895);
}

.book {
  position: absolute;
  top: calc(var(--reference-pixel) * 55);
  left: calc(var(--reference-pixel) * 274);
  width: calc(var(--reference-pixel) * 2676);
  height: calc(var(--reference-pixel) * 1620);
  border-radius: calc(var(--reference-pixel) * 40);
  /* The cover's bottom rim, below the pages: a band of paper 1573 to 1599 down from its top, then dark */
  background: linear-gradient(
    #242221 calc(var(--reference-pixel) * 1572),
    #6c655e calc(var(--reference-pixel) * 1573),
    #55524d calc(var(--reference-pixel) * 1586),
    #363330 calc(var(--reference-pixel) * 1598),
    #242221 calc(var(--reference-pixel) * 1599)
  );
}

/* The page stacks showing above the pages, between the cover's top rim and the paper */
.stack {
  position: absolute;
  border-radius: calc(var(--reference-pixel) * 30) 0 0 0;
}

.stack-left {
  top: calc(var(--reference-pixel) * 67);
  left: calc(var(--reference-pixel) * 442);
  width: calc(var(--reference-pixel) * 700);
  height: calc(var(--reference-pixel) * 27);
  background: #918466;
}

.stack-right {
  top: calc(var(--reference-pixel) * 70);
  left: calc(var(--reference-pixel) * 1940);
  width: calc(var(--reference-pixel) * 960);
  height: calc(var(--reference-pixel) * 24);
  background: #bfb4a8;
}

.pages {
  position: absolute;
  top: calc(var(--reference-pixel) * 94);
  left: calc(var(--reference-pixel) * 337);
  width: calc(var(--reference-pixel) * 2543);
  height: calc(var(--reference-pixel) * 1534);
  border-radius: calc(var(--reference-pixel) * 12);
  background: #ede4d7;
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

.panel-bar {
  position: absolute;
  top: calc(var(--reference-pixel) * 451);
  left: calc(var(--reference-pixel) * 29);
  display: flex;
  width: calc(var(--reference-pixel) * 595);
  height: calc(var(--reference-pixel) * 30);
  gap: calc(var(--reference-pixel) * 10);
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

.handbook-list {
  position: absolute;
  top: calc(var(--reference-pixel) * 317);
  left: calc(var(--reference-pixel) * 1121);
  width: calc(var(--reference-pixel) * 1670);
  margin: 0;
  padding: 0;
  list-style: none;
}

.commissions {
  height: calc(var(--reference-pixel) * 1230);
}

/* Each card's fill, with a 5 pixel edge and a pale line inside it */
.handbook-card {
  background: #ebe3d8;
  box-shadow:
    inset 0 0 0 calc(var(--reference-pixel) * 5) #dfd8cc,
    inset 0 0 0 calc(var(--reference-pixel) * 6) #f7f2e8;
}

/* Each row a card 242 tall */
.commission {
  position: absolute;
  left: 0;
  width: calc(var(--reference-pixel) * 1670);
  height: calc(var(--reference-pixel) * 242);
}

/* The title's lines 59 apart, centred on 90 down whether it takes one line or two, with the progress pill 13.5 under
   it: exact on a one-line title, and 7.5 low on a two-line one, where the game's pill rises 22 for its second line */
.commission-text {
  position: absolute;
  top: calc(var(--reference-pixel) * 90);
  left: calc(var(--reference-pixel) * 259);
  width: calc(var(--reference-pixel) * 760);
  translate: 0 -50%;
}

/* The game sets the title wider than Signika, so it is set 52 high and spaced 3 to take the game's line width */
.commission-title {
  margin: 0;
  color: #5a5856;
  font-size: calc(var(--reference-pixel) * 52);
  font-weight: 600;
  letter-spacing: calc(var(--reference-pixel) * 3);
  line-height: calc(var(--reference-pixel) * 59);
}

.commission-progress {
  position: absolute;
  top: calc(100% + var(--reference-pixel) * 13.5);
  left: calc(var(--reference-pixel) * 5);
  height: calc(var(--reference-pixel) * 43);
  margin: 0;
  padding: 0 calc(var(--reference-pixel) * 26);
  border-radius: calc(var(--reference-pixel) * 21.5);
  background: rgb(255 255 255 / 0.45);
  color: #82644a;
  font-size: calc(var(--reference-pixel) * 40);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 43);
}

.commission-reward {
  position: absolute;
  top: calc(var(--reference-pixel) * 50);
  width: calc(var(--reference-pixel) * 141);
  height: calc(var(--reference-pixel) * 141);
}

/* The preferred region sits where a row's rewards stand, centred on the title's line */
.commission-region {
  position: absolute;
  top: calc(var(--reference-pixel) * 121);
  left: calc(var(--reference-pixel) * 1018);
  margin: 0;
  color: #82644a;
  font-size: calc(var(--reference-pixel) * 48);
  font-weight: 600;
  translate: 0 -50%;
}

.commission-claim,
.encounter-points-use,
.domain-action {
  padding: calc(var(--reference-pixel) * 12) calc(var(--reference-pixel) * 30);
  color: #fff;
  font-size: calc(var(--reference-pixel) * 44);
  background: #5aa02c;
  border: 0;
  cursor: pointer;
}

/* A claimable commission's button stands where the region's line does not, on the row's right */
.commission-claim {
  position: absolute;
  top: calc(var(--reference-pixel) * 83);
  left: calc(var(--reference-pixel) * 1250);
}

/* The stage rewards sit under the four commissions, in the tab's own box */
.encounter-points {
  position: absolute;
  top: calc(var(--reference-pixel) * 1040);
  left: 0;
  display: flex;
  align-items: center;
  gap: calc(var(--reference-pixel) * 40);
  width: calc(var(--reference-pixel) * 1670);
  height: calc(var(--reference-pixel) * 150);
  color: #555453;
  font-size: calc(var(--reference-pixel) * 48);
}

.encounter-points-title,
.encounter-points-daily,
.encounter-points-stored {
  margin: 0;
  font-weight: 600;
}

.encounter-points-use {
  margin-left: auto;
}

.encounter-points-use:disabled {
  background: #a8a093;
  cursor: default;
}

.commission-check {
  position: absolute;
  top: calc(var(--reference-pixel) * 74);
  left: calc(var(--reference-pixel) * 1465);
  width: calc(var(--reference-pixel) * 93);
  height: calc(var(--reference-pixel) * 84);
  fill: #7fbc2c;
}

/* The quill over the cover's right edge: its outline traced in percentages of its box, filled with its measured colours,
   navy at the top and teal below */
.feather {
  position: absolute;
  top: calc(var(--reference-pixel) * 320);
  left: calc(var(--reference-pixel) * 2890);
  width: calc(var(--reference-pixel) * 190);
  height: calc(var(--reference-pixel) * 730);
  background: linear-gradient(#293349, #324c62 45%, #447586 78%);
  clip-path: polygon(
    66.8% 0.7%,
    93.2% 11%,
    96.8% 24.7%,
    93.2% 41.8%,
    86.8% 62.3%,
    76.8% 79.5%,
    66.8% 96.6%,
    57.9% 100%,
    1% 100%,
    1% 74.4%,
    7.9% 48.6%,
    21.1% 22.9%,
    34.2% 4.1%,
    47.4% 1.4%
  );
}

/* The slate banner over the cover's edge, its cross 67 square and 8 left of the banner's middle */
.ribbon {
  position: absolute;
  top: calc(var(--reference-pixel) * 183);
  left: calc(var(--reference-pixel) * 2887);
  display: grid;
  width: calc(var(--reference-pixel) * 158);
  height: calc(var(--reference-pixel) * 143);
  box-sizing: border-box;
  padding-right: calc(var(--reference-pixel) * 16);
  background: #384c5f;
  place-items: center;
}

.close {
  display: grid;
  padding: 0;
  border: none;
  background: transparent;
  cursor: inherit;
}

.close svg {
  width: calc(var(--reference-pixel) * 67);
  height: calc(var(--reference-pixel) * 67);
  fill: #d4bfb3;
  stroke: #d4bfb3;
}
/* The Domains tab's rows stack under the tab's top, each a card with its title and its one action on the right */
.domains {
  display: flex;
  flex-direction: column;
  gap: calc(var(--reference-pixel) * 20);
}

.domain {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--reference-pixel) * 24);
  padding: calc(var(--reference-pixel) * 24) calc(var(--reference-pixel) * 40);
}

.domain-title {
  margin: 0;
  color: #555453;
  font-size: calc(var(--reference-pixel) * 52);
  font-weight: 600;
}
</style>
