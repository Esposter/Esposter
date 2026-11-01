<script setup lang="ts">
import Row from "#src/components/ArtifactPicker/Row/Index.vue";
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
  <PickerShell class="artifact-picker" :title>
    <ul class="options">
      <li v-for="{ caption, id, name, rarity } of options" :key="id">
        <Row :caption :name :rarity @choose="emit('choose', id)" />
      </li>
    </ul>
    <GameButton class="close" :kind="GameButtonKind.Pill" tip="" @click="emit('close')">{{ closeLabel }}</GameButton>
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

.close {
  align-self: flex-end;
}
</style>
