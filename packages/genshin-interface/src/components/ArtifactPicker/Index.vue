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

defineProps<Props>();
const emit = defineEmits<{ choose: [id: string]; close: [] }>();
</script>

<template>
  <PickerShell :gap="16" :max-height="800" :title>
    <ul class="options picker-list">
      <li v-for="{ caption, id, name, rarity } of options" :key="id">
        <Row :caption :name :rarity @choose="emit('choose', id)" />
      </li>
    </ul>
    <GameButton class="close" :kind="GameButtonKind.Pill" tip="" @click="emit('close')">{{ closeLabel }}</GameButton>
  </PickerShell>
</template>

<style scoped>
.options {
  gap: calc(var(--unit) * 8);
}

.close {
  align-self: flex-end;
}
</style>

<style scoped src="../../styles/artifactPicker.css"></style>
