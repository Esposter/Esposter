<script setup lang="ts">
import type { Catalogue } from "#src/models/world/Catalogue";
import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { GameText } from "genshin-text";

import { computeJumpLandmarkTextKey } from "#src/services/map/computeJumpLandmarkTextKey";
import { computeJumpPose } from "#src/services/map/computeJumpPose";
import { findLandmarkArea } from "#src/services/map/findLandmarkArea";
import { GameButton, GameButtonKind } from "genshin-interface";
import {
  GAME_CREAM,
  GAME_INK,
  INTERACTION_HOVER_DURATION,
  INTERACTION_REST_DURATION,
} from "genshin-interface/constants";
import { GameTextKey } from "genshin-text";

interface Props {
  // The regions and their areas, which the chosen landmark's area is named from
  catalogue: Catalogue;
  // The game's words in the reader's language
  gameText: GameText;
}

// The landmark chosen on the map or in the list, whose panel names its area and jumps there on its Teleport Button
// Alone. Its close button clears it, which hides the panel
const landmark = defineModel<PlaceLandmark | undefined>("landmark");
const { catalogue, gameText } = defineProps<Props>();
const emit = defineEmits<{ jump: [pose: WorldJumpPose] }>();
const chosenArea = computed(() => landmark.value && findLandmarkArea(catalogue, landmark.value));
</script>

<template>
  <section v-if="landmark" class="teleport-panel">
    <header class="teleport-header">
      <h2 class="teleport-title">{{ gameText[computeJumpLandmarkTextKey(landmark)] }}</h2>
      <button
        class="teleport-close"
        type="button"
        :aria-label="gameText[GameTextKey.Back]"
        @click="landmark = undefined"
      >
        <svg viewBox="-1 -1 2 2" aria-hidden="true">
          <path d="M -0.7 -0.7 L 0.7 0.7 M 0.7 -0.7 L -0.7 0.7" />
        </svg>
      </button>
    </header>
    <p class="teleport-place">{{ chosenArea?.name }} - {{ chosenArea?.subregion }}</p>
    <GameButton class="teleport" :kind="GameButtonKind.Pill" tip="" @click="emit('jump', computeJumpPose(landmark))">
      {{ gameText[GameTextKey.Teleport] }}
    </GameButton>
  </section>
</template>

<style scoped>
/* Provisional: the teleport panel as the game's right-hand sidebar, measured off the captured PC waypoint clip
   (`captures/yt-Mhw53PsdhKI-waypoint.webm`, the Indonesian client): its header of 72 units, its place strip and its
   Teleport button 40 units off the bottom. The colours are estimated off that frame */
.teleport-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  width: calc(var(--unit) * 490);
  flex-direction: column;
  background: #efe9db;
  color: #3d4152;
}

.teleport-header {
  display: flex;
  height: calc(var(--unit) * 72);
  align-items: center;
  justify-content: space-between;
  padding: 0 calc(var(--unit) * 18) 0 calc(var(--unit) * 46);
  background: #3d4152;
  color: #f1e8cf;
}

.teleport-title {
  margin: 0;
  font-size: calc(var(--unit) * 30);
  font-weight: normal;
}

/* Its cross is stroked in the text's colour, and lit as a Disc is: hovered or focused, a navy disc behind it, and pressed,
   the disc cream with the cross ink. Provisional, as no recording shows the close lit */
.teleport-close {
  display: grid;
  width: calc(var(--unit) * 36);
  height: calc(var(--unit) * 36);
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: none;
  color: inherit;
  transition: background-color v-bind(INTERACTION_REST_DURATION);
}

.teleport-close svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 0.26;
}

.teleport-close:is(:focus-visible, [data-interaction-state="Hover"] *) {
  background: rgb(30 49 63 / 0.5);
  transition-duration: v-bind(INTERACTION_HOVER_DURATION);
}

@media (hover: hover) {
  .teleport-close:hover {
    background: rgb(30 49 63 / 0.5);
    transition-duration: v-bind(INTERACTION_HOVER_DURATION);
  }
}

.teleport-close:is(:active, [data-pressed], [data-interaction-state="Pressed"] *) {
  background: v-bind(GAME_CREAM);
  color: v-bind(GAME_INK);
  transition-duration: 0s;
}

.teleport-place {
  margin: calc(var(--unit) * 24) calc(var(--unit) * 14) 0;
  padding: calc(var(--unit) * 10) calc(var(--unit) * 16);
  border-radius: calc(var(--unit) * 4);
  background: #e0d4b6;
  font-size: calc(var(--unit) * 22);
}

.teleport {
  margin: auto calc(var(--unit) * 14) calc(var(--unit) * 40);
}
</style>
