<script setup lang="ts">
import type { InteractionPrompt } from "#src/models/InteractionPrompt";

import { INTERACTION_HOVER_MS, INTERACTION_KEY_LABEL } from "#src/services/constants";

interface Props {
  // Whether the rows are laid out for a touch screen, which has no key to press, so no row is the one it acts on
  isTouch?: boolean;
  // The rows the list's window shows, nearest first
  prompts: InteractionPrompt[];
  // The row F acts on
  selectedId: string;
}

const { isTouch = false, prompts, selectedId } = defineProps<Props>();
const emit = defineEmits<{
  // A row pressed itself, by a tap or by a click with the cursor shown, which acts on that row as F acts on the selected
  press: [id: string];
}>();
const selectionDuration = `${INTERACTION_HOVER_MS}ms`;
</script>

<template>
  <!-- The prompts beside the character: a row for each thing in reach, its kind's icon before its name in a pill, and the
       Key's cap before the row F acts on, with the pointer that leads from it into the pill. Measured off the English
       PC client's three-row pickup at 1080 high: each pill 63 high on a 72 pitch, its left edge 59 past the cap's, the
       cap 40 wide and 33 high, the icon 34 across. Each pill is a button of its own, as the game lets a row be pressed
       without the key -->
  <ul class="interaction-prompts" :class="{ touch: isTouch }">
    <li
      v-for="{ id, kind, name } of prompts"
      :key="id"
      class="prompt"
      :aria-current="(!isTouch && id === selectedId) || undefined"
      :data-kind="kind"
    >
      <kbd v-if="!isTouch" class="key" aria-hidden="true">{{ id === selectedId ? INTERACTION_KEY_LABEL : "" }}</kbd>
      <button class="pill" type="button" @click="emit('press', id)">
        <span class="icon" aria-hidden="true" />
        <span class="name">{{ name }}</span>
      </button>
    </li>
  </ul>
</template>

<style scoped>
/* Provisional: the icon, which stands in for the item's own art until its kind's icon is drawn */
.interaction-prompts {
  --pill-fill: #2a333f;
  display: flex;
  margin: 0;
  padding: 0;
  flex-direction: column;
  gap: calc(var(--unit) * 9);
  color: #fff;
  font-size: calc(var(--unit) * 31);
  font-weight: 600;
  list-style: none;
}

.prompt {
  display: grid;
  grid-template-columns: calc(var(--unit) * 59) calc(var(--unit) * 318);
  align-items: center;
  height: calc(var(--unit) * 63);
}

.key {
  position: relative;
  width: calc(var(--unit) * 40);
  height: calc(var(--unit) * 33);
  border-radius: calc(var(--unit) * 6);
  color: #000;
  font: inherit;
  font-size: calc(var(--unit) * 22);
  font-weight: 700;
  line-height: calc(var(--unit) * 33);
  text-align: center;
}

.prompt[aria-current="true"] .key {
  background: #fff;
}

/* The pointer from the cap into the pill: a white triangle 10.5 by 19 at 44.5 units from the cap's left edge, on every
   Row and shown on the selected one. A move of the selection is read off the English client's scrolled pickup at 60
   Frames a second: the cap jumps rows within a frame, while the pointer and the selected rim cross-fade from the old
   Row to the new over three, the 0.05 seconds the game's controllers fade into a state over */
.key::after {
  position: absolute;
  top: calc(var(--unit) * 7);
  left: calc(var(--unit) * 44.5);
  border-width: calc(var(--unit) * 9.5) 0 calc(var(--unit) * 9.5) calc(var(--unit) * 10.5);
  border-style: solid;
  border-color: transparent transparent transparent #ececec;
  content: "";
  opacity: 0;
  transition: opacity v-bind(selectionDuration) linear;
}

.prompt[aria-current="true"] .key::after {
  opacity: 1;
}

.pill {
  display: flex;
  position: relative;
  isolation: isolate;
  height: 100%;
  padding: 0 0 0 calc(var(--unit) * 12);
  align-items: center;
  border: none;
  background: none;
  color: inherit;
  cursor: inherit;
  font: inherit;
  gap: calc(var(--unit) * 19);
  pointer-events: auto;
  white-space: nowrap;
}

/* The touch layout, measured off the English mobile client's pickup at 934 high: no cap and no selected row, the pill
   In the cap's place, each 52 high on a 74 pitch */
.touch {
  gap: calc(var(--unit) * 22);
}

.touch .prompt {
  grid-template-columns: calc(var(--unit) * 318);
  height: calc(var(--unit) * 52);
}

/* The pill's ground, measured off the English client's pickup over plain grass at 1080 high: slate rounded at the left,
   With a light rim 2 units thick 2.5 inside its edge, opaque for 78 units and fading out evenly to nothing at its end,
   So it has no right end of its own. The selected row's rim is brighter */
.pill::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: calc(var(--unit) * 31.5) 0 0 calc(var(--unit) * 31.5);
  background: var(--pill-fill);
  box-shadow:
    inset 0 0 0 calc(var(--unit) * 2.5) var(--pill-fill),
    inset 0 0 0 calc(var(--unit) * 4.5) rgb(255 255 255 / 0.24);
  content: "";
  mask-image: linear-gradient(to right, #000 calc(var(--unit) * 78), transparent);
  transition: box-shadow v-bind(selectionDuration) linear;
}

.prompt[aria-current="true"] .pill::before {
  box-shadow:
    inset 0 0 0 calc(var(--unit) * 2.5) var(--pill-fill),
    inset 0 0 0 calc(var(--unit) * 4.5) rgb(255 255 255 / 0.41);
}

.name {
  margin-bottom: calc(var(--unit) * 2);
  letter-spacing: calc(var(--unit) * 0.9);
}

.icon {
  width: calc(var(--unit) * 34);
  height: calc(var(--unit) * 34);
  flex: none;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.18);
}
</style>
