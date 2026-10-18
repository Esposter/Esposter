<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
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
  <div class="artifact-picker" role="dialog" aria-modal="true" :aria-label="title">
    <p class="title">{{ title }}</p>
    <ul class="options">
      <li v-for="option of options" :key="option.id">
        <button class="option" :data-rarity="option.rarity" type="button" @click="emit('choose', option.id)">
          <span class="name">{{ option.name }}</span>
          <span class="caption">{{ option.caption }}</span>
        </button>
      </li>
    </ul>
    <GameButton class="close" :kind="GameButtonKind.Pill" @click="emit('close')">{{ closeLabel }}</GameButton>
  </div>
</template>

<style scoped>
.artifact-picker {
  position: absolute;
  top: calc(var(--unit) * 120);
  left: calc(var(--unit) * 120);
  width: calc(var(--unit) * 640);
  max-height: calc(var(--unit) * 800);
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 16);
  padding: calc(var(--unit) * 24);
  border-radius: calc(var(--unit) * 12);
  background: rgb(20 24 36 / 0.92);
  color: #ece3d8;
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
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

.caption {
  opacity: 0.8;
}

.close {
  align-self: flex-end;
}
</style>
