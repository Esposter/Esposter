<script setup lang="ts">
import type { InteractionPrompts } from "#src/models/interaction/InteractionPrompts";

import { INTERACTION_WINDOW_SIZE } from "#src/services/interaction/constants";
import { GameScreen, InteractionPrompts as InteractionPromptList } from "genshin-interface";

interface Props {
  // The prompts beside the character, whose window of rows the list draws
  interactionPrompts: InteractionPrompts;
}

const { interactionPrompts } = defineProps<Props>();
const windowInteractables = computed(() =>
  interactionPrompts.interactables.slice(
    interactionPrompts.windowStart,
    interactionPrompts.windowStart + INTERACTION_WINDOW_SIZE,
  ),
);
</script>

<template>
  <!-- The window of the prompts beside the character, its cap's left edge 139 units right of the screen's centre and its
       rows centred on the screen's middle. A full-screen layer that lets the pointer through to the world, as the HUD
       it is drawn in does; it is also a screen root of its own, so the parity page draws it with a unit -->
  <GameScreen class="prompt-list">
    <div class="prompts">
      <InteractionPromptList :prompts="windowInteractables" :selected-id="interactionPrompts.selectedId" />
    </div>
  </GameScreen>
</template>

<style scoped>
.prompt-list {
  pointer-events: none;
}

/* The prompt list's place, measured off the English PC client's pickup at 1080 high: its cap 139 units right of the
   centre, its rows' middle on the middle of the screen */
.prompts {
  position: absolute;
  left: calc(50% + var(--unit) * 139);
  top: 50%;
  transform: translateY(-50%);
}
</style>
