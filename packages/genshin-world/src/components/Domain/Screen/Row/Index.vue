<script setup lang="ts">
import type { DomainLevelRow } from "#src/models/domains/DomainLevelRow";
import type { GameText } from "genshin-text";

import { DomainLevelState } from "#src/models/domains/DomainLevelState";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The domain's level, with the state the player finds it in at their rank and today
  level: DomainLevelRow;
}

const { gameText, level } = defineProps<Props>();
const emit = defineEmits<{ enter: [dungeonId: number] }>();
// The line a level's state shows in place of its entry button: the rank it asks for, or that it is closed today
const stateText = computed(() => {
  if (level.state === DomainLevelState.RankRequired)
    return fillGameTextValues(gameText[GameTextKey.AvailableAtAdventureRank], level.requiredRank);
  if (level.state === DomainLevelState.Closed) return gameText[GameTextKey.Closed];
  return "";
});
</script>

<template>
  <!-- A level of a domain's list: its recommended and enemy levels, its state's line and its entry button -->
  <li>
    <span>{{ fillGameTextValues(gameText[GameTextKey.RecommendedLevel], level.requiredRank) }}</span>
    <span>{{ fillGameTextValues(gameText[GameTextKey.EnemyLevel], level.enemyLevel) }}</span>
    <span v-if="stateText">{{ stateText }}</span>
    <button type="button" :disabled="level.state !== DomainLevelState.Open" @click="emit('enter', level.dungeonId)">
      {{ gameText[GameTextKey.DomainEnter] }}
    </button>
  </li>
</template>
