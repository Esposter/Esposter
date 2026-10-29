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
const selectedIndex = computed(() =>
  windowInteractables.value.findIndex(({ id }) => id === interactionPrompts.selectedId),
);
// The gold arc from the marker down to the selected row's bottom, in the marker's own units, drawn only while that row is
// Below the window's middle: the pickup's first row shows none and its third row shows the arc, the two measured
// Selections. The rows are 72 units apart, and the middle row's centre is 24 units below the marker's top
const arcPath = computed(() => {
  if (selectedIndex.value <= (windowInteractables.value.length - 1) / 2) return undefined;
  const end = 48 + 72 * (selectedIndex.value - (windowInteractables.value.length - 1) / 2);
  return `M34 20Q57 ${(20 + end) / 2} 34 ${end}`;
});
</script>

<template>
  <!-- The window of the prompts beside the character, its cap's left edge 138 units right of the screen's centre and its
       rows centred one unit above the screen's middle. A full-screen layer that lets the pointer through to the world, as
       the HUD it is drawn in does; it is also a screen root of its own, so the parity page draws it with a unit -->
  <GameScreen class="prompt-list" :is-touch>
    <div class="prompts">
      <InteractionPromptList
        :is-touch
        :prompts="windowInteractables"
        :selected-id="interactionPrompts.selectedId"
        @press="(id) => emit('press', id)"
      />
    </div>
    <!-- The mouse wheel's marker at the list's middle, left of the rows: a translucent body with an arrow above and below
         and a gold bar in it, drawn in the 1920 by 1080 screen's own units from its top left corner at (1050, 515) -->
    <svg v-if="!isTouch" class="scroll" viewBox="0 0 48 130" aria-hidden="true">
      <ellipse cx="12" cy="22" rx="12" ry="17" fill="rgb(255 255 255 / 0.38)" />
      <path d="M12 2.5 18.5 10.5H5.5Z M12 44.4 18.5 35.6H5.5Z" fill="#fff" />
      <rect x="9" y="15" width="5" height="11" rx="2.5" fill="#fedd36" />
      <path v-if="arcPath" :d="arcPath" fill="none" stroke="#ffbe0c" stroke-linecap="round" stroke-width="5.5" />
    </svg>
  </GameScreen>
</template>

<style scoped>
.prompt-list {
  pointer-events: none;
}

/* The prompt list's place, measured off the English PC client's pickup at 1080 high: its cap 138 units right of the
   centre, its rows' middle one unit above the middle of the screen */
.prompts {
  position: absolute;
  left: calc(50% + var(--unit) * 138);
  top: calc(50% - var(--unit));
  transform: translateY(-50%);
}

.scroll {
  position: absolute;
  left: calc(50% + var(--unit) * 90);
  top: calc(50% - var(--unit) * 25);
  width: calc(var(--unit) * 48);
  height: calc(var(--unit) * 130);
}
</style>
