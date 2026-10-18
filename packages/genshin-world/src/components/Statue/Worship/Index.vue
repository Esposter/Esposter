<script setup lang="ts">
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { StatueLevel } from "#src/models/statue/StatueLevel";
import type { GameText } from "genshin-text";

import { getItemDefinition } from "#src/services/inventory/getItemDefinition";
import { WorshipScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";
import { computed } from "vue";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The Oculi the region has collected and not yet offered
  collectedCount: number;
  // The region's level, which an offer raises
  level: number;
  // The region's levels, each taking its Oculi and paying its rewards
  levels: StatueLevel[];
  // The game's material table by item id, and the item names by text id, which name each reward
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
}

const { collectedCount, gameText, level, levels, materialDataMap, nameText } = defineProps<Props>();
const emit = defineEmits<{ close: []; offer: [] }>();
// Each level's rewards read aloud as the game's item count line, a level reached once the region's level has reached it
const levelRows = computed(() =>
  levels.map(({ level: rowLevel, rewards }) => ({
    isReached: rowLevel <= level,
    level: rowLevel,
    rewards: rewards.map(({ itemCount, itemId }) => ({
      label: fillGameTextValues(
        gameText[GameTextKey.ItemCount],
        getItemDefinition(itemId, nameText, materialDataMap).name,
        itemCount,
      ),
    })),
  })),
);
</script>

<template>
  <WorshipScreen
    :collected-count="collectedCount"
    :level
    :levels="levelRows"
    :offer-label="gameText[GameTextKey.StatueOffer]"
    :title="gameText[GameTextKey.StatueWorship]"
    @close="emit('close')"
    @offer="emit('offer')"
  />
</template>
