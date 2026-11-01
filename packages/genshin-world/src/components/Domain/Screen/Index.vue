<script setup lang="ts">
import type { DomainLevelRow } from "#src/models/domains/DomainLevelRow";
import type { GameText } from "genshin-text";

import DomainScreenRow from "#src/components/Domain/Screen/Row/Index.vue";
import { GameButton, GameButtonKind, GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // Whether the player is inside the domain, whose screen then asks to leave it instead of listing its levels
  isInDomain: boolean;
  // The domain's levels, each with the state the player finds it in at their rank and today
  levels: DomainLevelRow[];
}

const { gameText, isInDomain, levels } = defineProps<Props>();
const emit = defineEmits<{ close: []; enter: [dungeonId: number]; leave: [] }>();
</script>

<template>
  <GameScreen role="dialog" aria-modal="true" :aria-label="gameText[GameTextKey.DomainTitle]">
    <div v-if="isInDomain">
      <p>{{ gameText[GameTextKey.DomainLeavePrompt] }}</p>
      <GameButton :kind="GameButtonKind.Row" tip="" @click="emit('leave')">
        {{ gameText[GameTextKey.DomainLeave] }}
      </GameButton>
      <GameButton :kind="GameButtonKind.Row" tip="" @click="emit('close')">{{ gameText[GameTextKey.Back] }}</GameButton>
    </div>
    <div v-else>
      <h2>{{ gameText[GameTextKey.DomainTitle] }}</h2>
      <ul>
        <DomainScreenRow
          v-for="level in levels"
          :key="level.dungeonId"
          :game-text
          :level
          @enter="(dungeonId) => emit('enter', dungeonId)"
        />
      </ul>
      <GameButton :kind="GameButtonKind.Row" tip="" @click="emit('close')">{{ gameText[GameTextKey.Back] }}</GameButton>
    </div>
  </GameScreen>
</template>
