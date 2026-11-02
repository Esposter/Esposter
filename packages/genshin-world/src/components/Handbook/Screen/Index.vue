<script setup lang="ts">
import type { HandbookCommission } from "#src/models/handbook/HandbookCommission";
import type { HandbookDayCommission } from "#src/models/handbook/HandbookDayCommission";
import type { HandbookDomain } from "#src/models/handbook/HandbookDomain";
import type { HandbookReward } from "#src/models/handbook/HandbookReward";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { GameText } from "genshin-text";

import HandbookScreenClose from "#src/components/Handbook/Screen/Close/Index.vue";
import HandbookScreenCommissions from "#src/components/Handbook/Screen/Commissions/Index.vue";
import HandbookScreenDomains from "#src/components/Handbook/Screen/Domains/Index.vue";
import HandbookScreenExperience from "#src/components/Handbook/Screen/Experience/Index.vue";
import HandbookScreenTabs from "#src/components/Handbook/Screen/Tabs/Index.vue";
import { HandbookTab } from "#src/models/handbook/HandbookTab";
import { GameScreen } from "genshin-interface";

interface Props {
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
  // Whether a Long-Term Encounter Point can be converted now, so its button is enabled
  isLongTermEncounterPointUsable: boolean;
  // The panel's reward footer, shown once every reward is taken
  isRewardClaimed: boolean;
  // The Long-Term Encounter Points held, as whole points, which the Commissions tab's stage rewards count
  longTermEncounterPoints: number;
  // The names the commissions' titles cite, by their name text id, in the reader's language
  nameText: Readonly<Record<string, string>>;
  totalCount: number;
}

const {
  commissions,
  completedCount,
  dayCommissions,
  domains,
  encounterPointLimit,
  encounterPoints,
  gameText,
  investigationRewards,
  isAdventureEncountersUnlocked,
  isLongTermEncounterPointUsable,
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
      <HandbookScreenTabs v-model:tab="tab" :game-text />
      <HandbookScreenExperience
        v-if="tab === HandbookTab.Experience"
        :commissions
        :completed-count
        :game-text
        :investigation-rewards
        :is-reward-claimed
        :total-count
      />
      <HandbookScreenCommissions
        v-else-if="tab === HandbookTab.Commissions"
        :is-long-term-encounter-point-usable
        :day-commissions
        :encounter-point-limit
        :encounter-points
        :game-text
        :is-adventure-encounters-unlocked
        :long-term-encounter-points
        :name-text
        @claim-commission="(commissionId) => emit('claimCommission', commissionId)"
        @use-long-term-encounter-points="emit('useLongTermEncounterPoints')"
      />
      <HandbookScreenDomains
        v-else-if="tab === HandbookTab.Domains"
        :domains
        :game-text
        @challenge="(landmark) => emit('challenge', landmark)"
        @claim-first-clear="(entryId) => emit('claimFirstClear', entryId)"
      />
      <div class="feather" />
      <HandbookScreenClose :game-text @close="emit('close')" />
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
</style>
