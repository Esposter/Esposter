<script setup lang="ts">
import type { ReputationCity } from "#src/models/reputation/ReputationCity";
import type { ReputationProgress } from "#src/models/reputation/ReputationProgress";
import type { GameText } from "genshin-text";

import { GameScreen, ReputationScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The nation's Reputation the player holds: its level, and the EXP toward the next
  progress: ReputationProgress;
  // The nation's levels and their rewards, as the game's table gives them
  reputation: ReputationCity;
}

const { gameText, progress, reputation } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const levelId = defineModel<number>("levelId", { required: true });
// A level is achieved once the nation's Reputation has reached it; its unlock line waits on the features' own words, and
// The words its achieved mark and item count are read aloud with wait on game text naming them
const levels = computed(() =>
  reputation.levels.map(({ level, reward }) => ({
    id: level,
    isAchieved: level <= progress.level,
    itemCount: reward.items.length,
    itemCountLabel: "",
    levelLabel: fillGameTextValues(gameText[GameTextKey.LevelFormat], level),
    statusLabel: gameText[GameTextKey.ReputationNotAchieved],
    unlockLabel: "",
  })),
);
</script>

<template>
  <!-- The reward page, opened over the world by the nation's keeper: the title names the nation, each level lists its
       items and whether it is achieved. The picked level's name and requirement wait on the items' and the requirements'
       names, which the hosted game data does not carry yet -->
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.CityReputation]">
    <ReputationScreen
      v-model:level-id="levelId"
      achieved-label=""
      :back-label="gameText[GameTextKey.Back]"
      headline=""
      :levels
      :requirement="[]"
      :title="fillGameTextValues(gameText[GameTextKey.ReputationReward], gameText[GameTextKey.Mondstadt])"
      @close="emit('close')"
    />
  </GameScreen>
</template>
