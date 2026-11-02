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

// The level the screen shows: the lowest one whose rewards are not yet claimed, or the last once all are. Its Oculus is the
// first item it takes, and its state is the one a claim reads, a claim taking one level at a time
const shownLevel = computed(() => {
  const statueLevel = levels.find(({ level }) => level > progress.claimedLevel) ?? levels.at(-1);
  if (!statueLevel) return undefined;
  const [oculusItem] = statueLevel.items;
  return {
    level: statueLevel.level,
    oculus: oculusItem && { count: oculusItem.itemCount, name: getItemName(oculusItem.itemId) },
    rewards: statueLevel.rewards.map(({ itemCount, itemId }) => ({ count: itemCount, name: getItemName(itemId) })),
    staminaShare: statueLevel.staminaShare,
    state: getStatueLevelState(statueLevel.level, progress.level, progress.claimedLevel),
  };
});
</script>

<template>
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.StatueWorship]">
    <WorshipScreen
      v-if="shownLevel"
      :blessing-title="gameText[GameTextKey.StatueBlessing]"
      :close-label="gameText[GameTextKey.Back]"
      :held-count="progress.heldCount"
      :level="shownLevel"
      :level-label="gameText[GameTextKey.LevelShort]"
      :offer-all-label="gameText[GameTextKey.StatueOfferAll]"
      :offer-label="gameText[GameTextKey.StatueOffer]"
      :owned-label="gameText[GameTextKey.StatueOwned]"
      :required-label="gameText[GameTextKey.CraftingRequired]"
      :rewards-label="gameText[GameTextKey.StatueRewards]"
      :stamina-label="gameText[GameTextKey.Stamina]"
      :title="gameText[GameTextKey.StatueWorship]"
      @blessing="emit('blessing')"
      @claim="emit('claim')"
      @close="emit('close')"
      @offer="emit('offer')"
    />
  </GameScreen>
</template>
