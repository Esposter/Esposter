<script setup lang="ts">
import type { InteractionPrompts } from "#src/models/interaction/InteractionPrompts";

import { INTERACTION_WINDOW_SIZE } from "#src/services/interaction/constants";
import { InteractionPrompts as InteractionPromptList } from "genshin-interface";

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
  <!-- The window of the prompts beside the character, beside the centre of the screen. Provisional: its place waits on the
       Interaction's passes against a recording of the English client at 1080 high -->
  <div class="prompts">
    <InteractionPromptList :prompts="windowInteractables" :selected-id="interactionPrompts.selectedId" />
  </div>
</template>

<style scoped>
/* Provisional: the prompt list's place, until the recreation passes measure it */
.prompts {
  position: absolute;
  left: calc(50% + var(--unit) * 260);
  top: 50%;
}
</style>
