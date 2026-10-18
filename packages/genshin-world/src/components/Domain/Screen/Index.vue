<script setup lang="ts">
import type { DomainLevelRow } from "#src/services/domains/computeDomainLevelRows";
import type { GameText } from "genshin-text";

import { DomainLevelState } from "#src/models/domains/DomainLevelState";
import { GameScreen } from "genshin-interface";
import { fillGameTextValues, GameTextKey } from "genshin-text";

interface Props {
  // Whether the player is inside the domain, whose screen then asks to leave it instead of listing its levels
  isInDomain: boolean;
  // The domain's levels, each with the state the player finds it in at their rank and today
  levels: DomainLevelRow[];
  // The game's words in the reader's language
  gameText: GameText;
}

const { gameText, isInDomain, levels } = defineProps<Props>();
const emit = defineEmits<{ close: []; enter: [dungeonId: number]; leave: [] }>();
// The line a level's state shows in place of its entry button: the rank it asks for, or that it is closed today
const getStateText = ({ requiredRank, state }: DomainLevelRow): string | undefined => {
  if (state === DomainLevelState.RankRequired)
    return fillGameTextValues(gameText[GameTextKey.AvailableAtAdventureRank], requiredRank);
  if (state === DomainLevelState.Closed) return gameText[GameTextKey.Closed];
};
</script>

<template>
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.DomainTitle]">
    <div v-if="isInDomain">
      <p>{{ gameText[GameTextKey.DomainLeavePrompt] }}</p>
      <button type="button" @click="emit('leave')">{{ gameText[GameTextKey.DomainLeave] }}</button>
      <button type="button" @click="emit('close')">{{ gameText[GameTextKey.Back] }}</button>
    </div>
    <div v-else>
      <h2>{{ gameText[GameTextKey.DomainTitle] }}</h2>
      <ul>
        <li v-for="level in levels" :key="level.dungeonId">
          <span>{{ fillGameTextValues(gameText[GameTextKey.RecommendedLevel], level.requiredRank) }}</span>
          <span>{{ fillGameTextValues(gameText[GameTextKey.EnemyLevel], level.enemyLevel) }}</span>
          <span v-if="getStateText(level)">{{ getStateText(level) }}</span>
          <button
            type="button"
            :disabled="level.state !== DomainLevelState.Open"
            @click="emit('enter', level.dungeonId)"
          >
            {{ gameText[GameTextKey.DomainEnter] }}
          </button>
        </li>
      </ul>
      <button type="button" @click="emit('close')">{{ gameText[GameTextKey.Back] }}</button>
    </div>
  </GameScreen>
</template>
