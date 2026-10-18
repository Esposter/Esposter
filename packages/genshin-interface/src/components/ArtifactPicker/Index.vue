<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import PickerShell from "#src/components/PickerShell/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

// One artifact the picker lists: its name in the reader's language, its caption, its rarity in stars and its entry's id
interface ArtifactPickerOption {
  caption: string;
  id: string;
  name: string;
  rarity: number;
}

interface Props {
  // The way out of the picker without choosing, the game's word for cancelling
  closeLabel: string;
  // The artifacts to choose from, in the order the game lists them
  options: ArtifactPickerOption[];
  // The picker's title, the action the artifact is chosen for
  title: string;
}

const { closeLabel, options, title } = defineProps<Props>();
const emit = defineEmits<{ choose: [id: string]; close: [] }>();
</script>

<template>
  <PickerShell class="artifact-picker" :title="title">
    <ul class="options">
      <li v-for="option of options" :key="option.id">
        <button class="option" :data-rarity="option.rarity" type="button" @click="emit('choose', option.id)">
          <span class="name">{{ option.name }}</span>
          <span class="caption">{{ option.caption }}</span>
        </button>
      </li>
    </ul>
    <GameButton class="close" :kind="GameButtonKind.Pill" @click="emit('close')">{{ closeLabel }}</GameButton>
  </PickerShell>
</template>

<style scoped>
.artifact-picker {
  max-height: calc(var(--unit) * 800);
  gap: calc(var(--unit) * 16);
}

.options {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 8);
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.option {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: calc(var(--unit) * 12) calc(var(--unit) * 16);
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: rgb(255 255 255 / 0.1);
  color: inherit;
  font: inherit;
  text-align: left;
}

.option:hover,
.option:focus-visible {
  background: rgb(255 255 255 / 0.2);
}

.close {
  align-self: flex-end;
}
</style>
