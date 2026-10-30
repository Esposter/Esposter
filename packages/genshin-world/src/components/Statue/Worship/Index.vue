<script setup lang="ts">
import type { StatueLevel } from "#src/models/statue/StatueLevel";
import type { StatueRegionProgressSave } from "#src/models/statue/StatueProgressSave";
import type { GameText } from "genshin-text";

import { getStatueLevelState } from "#src/services/statue/getStatueLevelState";
import { GameScreen, WorshipScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The name of an item in the reader's language, by its id
  getItemName: (itemId: number) => string;
  // The region's levels, read as the screen opened
  levels: StatueLevel[];
  // The region's progress as the save holds it: the Oculi held, the level reached and the level claimed
  progress: StatueRegionProgressSave;
}

const { gameText, getItemName, levels, progress } = defineProps<Props>();
const emit = defineEmits<{ blessing: []; claim: []; close: []; offer: [] }>();

// Each level with the Oculi it takes, the rewards it pays and its state, which a claim takes one level of at a time
const getWorshipLevels = () =>
  levels.map((level) => ({
    level: level.level,
    oculusCount: level.items.reduce((count, { itemCount }) => count + itemCount, 0),
    rewards: level.rewards.map(({ itemCount, itemId }) => ({ count: itemCount, name: getItemName(itemId) })),
    state: getStatueLevelState(level.level, progress.level, progress.claimedLevel),
  }));
</script>

<template>
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.StatueWorship]">
    <WorshipScreen
      :blessing-title="gameText[GameTextKey.StatueBlessing]"
      :close-label="gameText[GameTextKey.Back]"
      :held-count="progress.heldCount"
      :levels="getWorshipLevels()"
      :title="gameText[GameTextKey.StatueWorship]"
      @blessing="emit('blessing')"
      @claim="emit('claim')"
      @close="emit('close')"
      @offer="emit('offer')"
    />
  </GameScreen>
</template>
