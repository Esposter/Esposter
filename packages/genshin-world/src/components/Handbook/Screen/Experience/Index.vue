<script setup lang="ts">
import type { HandbookCommission } from "#src/models/handbook/HandbookCommission";
import type { HandbookReward } from "#src/models/handbook/HandbookReward";
import type { GameText } from "genshin-text";

import HandbookScreenExperienceHeader from "#src/components/Handbook/Screen/Experience/Header/Index.vue";
import HandbookScreenExperiencePanel from "#src/components/Handbook/Screen/Experience/Panel/Index.vue";
import HandbookScreenExperienceRow from "#src/components/Handbook/Screen/Experience/Row/Index.vue";
import { HandbookTab } from "#src/models/handbook/HandbookTab";
import { HandbookTabGameTextKeyMap } from "#src/services/handbook/HandbookTabGameTextKeyMap";

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
  isRewardClaimed: boolean;
  totalCount: number;
}

const { commissions, completedCount, gameText, investigationRewards, isRewardClaimed, totalCount } =
  defineProps<Props>();
</script>

<template>
  <HandbookScreenExperienceHeader :game-text />
  <HandbookScreenExperiencePanel :completed-count :game-text :investigation-rewards :is-reward-claimed :total-count />
  <ol class="commissions handbook-list" :aria-label="gameText[HandbookTabGameTextKeyMap[HandbookTab.Experience]]">
    <HandbookScreenExperienceRow
      v-for="(commission, index) of commissions"
      :key="index"
      :commission
      :game-text
      :index
    />
  </ol>
</template>

<style scoped src="../../../../styles/handbookCards.css"></style>
