<script setup lang="ts">
import type { InteractionPrompts } from "#src/models/interaction/InteractionPrompts";

import { INTERACTION_WINDOW_SIZE } from "#src/services/interaction/constants";
import { GameScreen, InteractionPrompts as InteractionPromptList } from "genshin-interface";

interface Props {
  // The prompts beside the character, whose window of rows the list draws
  interactionPrompts: InteractionPrompts;
  // Whether the rows are laid out for a touch screen, at its scale and with no key
  isTouch: boolean;
}

const { interactionPrompts, isTouch } = defineProps<Props>();
const emit = defineEmits<{
  // A row pressed itself, which acts on it
  press: [id: string];
}>();
const windowInteractables = computed(() =>
  interactionPrompts.interactables.slice(
    interactionPrompts.windowStart,
    interactionPrompts.windowStart + INTERACTION_WINDOW_SIZE,
  ),
);
</script>

<template>
  <!-- The window of the prompts beside the character, its cap's left edge 138 units right of the screen's centre and its
       rows centred on the screen's middle. A full-screen layer that lets the pointer through to the world, as the HUD
       it is drawn in does; it is also a screen root of its own, so the parity page draws it with a unit -->
  <GameScreen class="prompt-list" :is-touch>
    <div class="prompts">
      <InteractionPromptList
        :is-touch
        :prompts="windowInteractables"
        :selected-id="interactionPrompts.selectedId"
        @press="(id) => emit('press', id)"
      />
    </div>
  </GameScreen>
</template>

<style scoped>
.prompt-list {
  pointer-events: none;
}

/* The prompt list's place, measured off the English PC client's pickup at 1080 high: its cap 138 units right of the
   centre, its rows' middle on the middle of the screen */
.prompts {
  position: absolute;
  left: calc(50% + var(--unit) * 138);
  top: 50%;
  transform: translateY(-50%);
}
</style>
