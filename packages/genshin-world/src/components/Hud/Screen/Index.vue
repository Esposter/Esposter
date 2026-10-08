<script setup lang="ts">
import type { MapCamera } from "#src/models/map/MapCamera";
import type { Landmark } from "#src/models/world/Landmark";
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";
import type { VNode } from "vue";

import HudMinimap from "#src/components/Hud/Minimap/Index.vue";
import HudPaimonButton from "#src/components/Hud/PaimonButton/Index.vue";
import HudTouch from "#src/components/Hud/Touch/Index.vue";
import { useMediaQuery } from "@vueuse/core";
import { GameScreen } from "genshin-interface";

interface Props {
  camera: MapCamera;
  // The game's words in the reader's language
  gameText: GameText;
  input: Input;
  landmarks: Landmark[];
}

defineSlots<{
  // The member on the field's HP bar and level, at the bottom's middle
  health?: () => VNode;
  // The deployed team down the right side
  party?: () => VNode;
  // The tracked quest, under the minimap
  quest?: () => VNode;
  // The skill and burst buttons, at the bottom right
  skills?: () => VNode;
  // The stamina meter beside the character, which places itself where the character stands on the screen
  stamina?: () => VNode;
}>();
const { camera, gameText, input, landmarks } = defineProps<Props>();
const emit = defineEmits<{ map: []; menu: [] }>();
// A device whose main pointer is a finger has no keys or mouse to move and look with, so the touch controls are drawn
const isTouch = useMediaQuery("(pointer: coarse)");
</script>

<template>
  <!-- The heads-up display over the world: only the pieces the world backs, each in its place. The Paimon button and
       The minimap in the top left with the quest tracker under them, the party down the right, the member on the
       Field's health at the bottom's middle, the skill and burst at the bottom right, the stamina meter where it places
       Itself, and on a touch screen the touch controls under them all. Everything between the pieces lets the pointer
       Through to the world, and a press on a piece stays the piece's, never reaching the world's input as an attack -->
  <GameScreen class="hud" @mousedown.stop>
    <HudTouch v-if="isTouch" :game-text :input />
    <div class="corner">
      <HudPaimonButton :game-text @press="emit('menu')" />
      <HudMinimap :camera :game-text :landmarks @open="emit('map')" />
    </div>
    <div class="quest"><slot name="quest" /></div>
    <div class="party"><slot name="party" /></div>
    <div class="health"><slot name="health" /></div>
    <div class="skills"><slot name="skills" /></div>
    <slot name="stamina" />
  </GameScreen>
</template>

<style scoped>
.hud {
  pointer-events: none;
}

/* Provisional: each piece's place, read off the HUD's RectTransform tree once its block is found, and measured off a
   Recording of the English PC client's world HUD until then */
.corner {
  position: absolute;
  top: calc(var(--unit) * 24);
  left: calc(var(--canvas-inset) + var(--unit) * 32);
  display: flex;
  align-items: flex-start;
  gap: calc(var(--unit) * 24);
}

.quest {
  position: absolute;
  top: calc(var(--unit) * 270);
  left: calc(var(--canvas-inset) + var(--unit) * 32);
}

.party {
  position: absolute;
  top: 50%;
  right: calc(var(--canvas-inset) + var(--unit) * 32);
  translate: 0 -50%;
}

.health {
  position: absolute;
  bottom: calc(var(--unit) * 40);
  left: 50%;
  translate: -50% 0;
}

.skills {
  position: absolute;
  right: calc(var(--canvas-inset) + var(--unit) * 64);
  bottom: calc(var(--unit) * 40);
}
</style>
