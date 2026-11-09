<script setup lang="ts">
import type { ReputationLevelCell } from "#src/models/ReputationLevelCell";
import type { TextSegment } from "#src/models/TextSegment";

import ReputationScreenDetail from "#src/components/ReputationScreen/Detail/Index.vue";
import ReputationScreenHead from "#src/components/ReputationScreen/Head/Index.vue";
import ReputationScreenLevel from "#src/components/ReputationScreen/Level/Index.vue";
import ReputationScreenOffer from "#src/components/ReputationScreen/Offer/Index.vue";
import { GAME_REPLY_HOVER_INK } from "#src/services/constants";

interface Props {
  // The achieved mark's words in the reader's language, read to assistive technology in place of the mark
  achievedLabel: string;
  // The way back to the world in the reader's language
  backLabel: string;
  // The picked level's reward, named as the game names it
  headline: string;
  // The badge's word over each level's number, "Lv." in English
  levelLabel: string;
  // The levels in the game's order, each a row the picked one is drawn over
  levels: ReputationLevelCell[];
  // The words a level the nation's Reputation has not reached shows in place of the achieved mark
  notAchievedLabel: string;
  // The request the keeper offers, its title and the button that takes it in the reader's language, or none where she
  // Offers none
  offer?: { acceptLabel: string; title: string };
  // The picked level's requirement, its coloured runs as the game words them, "[]" where the screen names none
  requirement: TextSegment[];
  // The title the game shows over the page, its nation's name filled in
  title: string;
}

const level = defineModel<number>("level", { default: 0 });
defineProps<Props>();
const emit = defineEmits<{ accept: []; close: [] }>();
</script>

<template>
  <!-- The Reputation reward page, the nation's keeper opens: its title across the head with the way back, the picked
       level's reward and requirement on the left, and the levels down the right. Each row is the public clip's at 1080
       high (references/reputation-screen): its level on a pentagon badge, its items in slots coloured by rarity with
       their count beneath, its unlock line behind an info mark, and the tick or the not achieved block at its end. The
       head and the left column are still provisional: the reference frames only the level list -->
  <div class="reputation-screen">
    <ReputationScreenHead :back-label :title @close="emit('close')" />
    <ReputationScreenDetail :headline :requirement />
    <ReputationScreenOffer v-if="offer" :offer @accept="emit('accept')" />
    <ul class="levels">
      <li v-for="cell of levels" :key="cell.level">
        <ReputationScreenLevel v-model:level="level" :achieved-label :cell :level-label :not-achieved-label />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.reputation-screen {
  position: absolute;
  inset: 0;
  color: v-bind(GAME_REPLY_HOVER_INK);
  font-weight: 600;
}

/* The list's panel, its rows 126 apart from 27 down and 32 in, a row 1145 wide */
.levels {
  position: absolute;
  top: calc(var(--unit) * 145);
  left: calc(var(--unit) * 652);
  display: flex;
  width: calc(var(--unit) * 1220);
  height: calc(var(--unit) * 870);
  flex-direction: column;
  gap: calc(var(--unit) * 5);
  margin: 0;
  padding: calc(var(--unit) * 27) calc(var(--unit) * 43) calc(var(--unit) * 27) calc(var(--unit) * 32);
  box-sizing: border-box;
  overflow-y: auto;
  background: #f0ebe5;
  list-style: none;
  scrollbar-width: none;
}
</style>
