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
  <!-- The prompts beside the character: a row for each thing in reach, its kind's icon before its name, and the key's
       Cap before the row F acts on. Provisional: every place, size and colour here, and the kinds' icons, wait on the
       Interaction's passes against a recording of the English client at 1080 high -->
  <ul class="interaction-prompts">
    <li
      v-for="{ id, kind, name } of prompts"
      :key="id"
      class="prompt"
      :aria-current="id === selectedId || undefined"
      :data-kind="kind"
    >
      <kbd class="key" aria-hidden="true">{{ id === selectedId ? INTERACTION_KEY_LABEL : "" }}</kbd>
      <span class="icon" aria-hidden="true" />
      <span class="name">{{ name }}</span>
    </li>
  </ul>
</template>

<style scoped>
.interaction-prompts {
  display: flex;
  width: calc(var(--unit) * 360);
  margin: 0;
  padding: 0;
  flex-direction: column;
  gap: calc(var(--unit) * 6);
  color: #ece5d8;
  font-size: calc(var(--unit) * 22);
  list-style: none;
}

.prompt {
  display: grid;
  grid-template-columns: calc(var(--unit) * 36) calc(var(--unit) * 36) 1fr;
  align-items: center;
  gap: calc(var(--unit) * 10);
  height: calc(var(--unit) * 44);
}

.key {
  display: grid;
  height: calc(var(--unit) * 32);
  border-radius: calc(var(--unit) * 6);
  font: inherit;
  place-items: center;
}

.prompt[aria-current="true"] .key {
  background: #ece5d8;
  color: #3b4255;
}

.icon {
  width: calc(var(--unit) * 32);
  height: calc(var(--unit) * 32);
  border-radius: 50%;
  background: rgb(255 255 255 / 0.2);
}

.name {
  padding: calc(var(--unit) * 6) calc(var(--unit) * 14);
  background: rgb(0 0 0 / 0.35);
}

.prompt[aria-current="true"] .name {
  background: rgb(0 0 0 / 0.55);
}
</style>
