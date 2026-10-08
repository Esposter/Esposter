<script setup lang="ts">
import type { InteractionPrompt } from "#src/models/InteractionPrompt";

import { INTERACTION_KEY_LABEL } from "#src/services/constants";

interface Props {
  // The rows the list's window shows, nearest first
  prompts: InteractionPrompt[];
  // The row F acts on
  selectedId: string;
}

const { prompts, selectedId } = defineProps<Props>();
</script>

<template>
  <!-- The prompts beside the character: a row for each thing in reach, its kind's icon before its name in a pill, and the
       Key's cap before the row F acts on, with the pointer that leads from it into the pill. Measured off the English
       PC client's three-row pickup at 1080 high: each row 59 high on a 72 pitch, the cap 40 wide and 33 high, the icon
       34 across, the name's cap height 22 -->
  <ul class="interaction-prompts">
    <li
      v-for="{ id, kind, name } of prompts"
      :key="id"
      class="prompt"
      :aria-current="id === selectedId || undefined"
      :data-kind="kind"
    >
      <kbd class="key" aria-hidden="true">{{ id === selectedId ? INTERACTION_KEY_LABEL : "" }}</kbd>
      <span class="pill">
        <span class="icon" aria-hidden="true" />
        <span class="name">{{ name }}</span>
      </span>
    </li>
  </ul>
</template>

<style scoped>
/* Provisional: the pill's right end and its fill, which the recording's scene shows through and does not measure, and
   the icon, which stands in for the item's own art until its kind's icon is drawn */
.interaction-prompts {
  display: flex;
  margin: 0;
  padding: 0;
  flex-direction: column;
  gap: calc(var(--unit) * 13);
  color: #fff;
  font-size: calc(var(--unit) * 31);
  font-weight: 600;
  list-style: none;
}

.prompt {
  display: grid;
  grid-template-columns: calc(var(--unit) * 60) calc(var(--unit) * 290);
  align-items: center;
  height: calc(var(--unit) * 59);
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

/* The pointer from the cap into the pill: a white triangle 8 by 15 at 45 units from the cap's left edge */
.prompt[aria-current="true"] .key::after {
  position: absolute;
  top: calc(var(--unit) * 7.5);
  left: calc(var(--unit) * 45);
  border-width: calc(var(--unit) * 7.5) 0 calc(var(--unit) * 7.5) calc(var(--unit) * 8);
  border-style: solid;
  border-color: transparent transparent transparent #ececec;
  content: "";
}

.pill {
  display: flex;
  box-sizing: border-box;
  height: 100%;
  padding-left: calc(var(--unit) * 12);
  border: calc(var(--unit) * 1) solid rgb(255 255 255 / 0.45);
  border-radius: calc(var(--unit) * 30);
  background: rgb(18 24 34 / 0.6);
  align-items: center;
  gap: calc(var(--unit) * 17);
  white-space: nowrap;
}

.name {
  margin-bottom: calc(var(--unit) * 4);
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
