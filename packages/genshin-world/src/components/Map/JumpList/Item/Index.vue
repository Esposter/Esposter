<script setup lang="ts">
import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";
import type { GameText } from "genshin-text";

import { computeJumpLandmarkTextKey } from "#src/services/map/computeJumpLandmarkTextKey";
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The name of the area the landmark stands in, which the row's first line names
  areaName: string;
  // The game's words in the reader's language, the kind of place the row's second line names
  gameText: GameText;
  // The place the row jumps to
  landmark: PlaceLandmark;
}

const { areaName, gameText, landmark } = defineProps<Props>();
const emit = defineEmits<{ jump: [] }>();
</script>

<template>
  <GameButton class="jump" :kind="GameButtonKind.Row" tip="" @click="emit('jump')">
    <span>{{ areaName }}</span>
    <span class="kind">{{ gameText[computeJumpLandmarkTextKey(landmark)] }}</span>
  </GameButton>
</template>

<style scoped>
.jump {
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: calc(var(--unit) * 12) calc(var(--unit) * 16);
  border-radius: calc(var(--unit) * 8);
  background: rgb(255 255 255 / 0.08);
  color: inherit;
  font-size: calc(var(--unit) * 24);
  text-align: start;
}

.kind {
  font-size: calc(var(--unit) * 18);
  opacity: 0.7;
}
</style>
