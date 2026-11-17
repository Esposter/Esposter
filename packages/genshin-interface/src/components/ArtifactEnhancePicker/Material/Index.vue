<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // How many of the material the bag holds
  count: number;
  // The material's name in the reader's language
  name: string;
  // How many of the material are chosen for the enhancement
  selectedCount: number;
}

defineProps<Props>();
const emit = defineEmits<{ material: [delta: number] }>();
</script>

<template>
  <li class="material">
    <span class="name">{{ name }}</span>
    <span class="count">{{ selectedCount }}/{{ count }}</span>
    <GameButton :disabled="selectedCount <= 0" :kind="GameButtonKind.Pill" tip="" @click="emit('material', -1)">
      -
    </GameButton>
    <GameButton :disabled="selectedCount >= count" :kind="GameButtonKind.Pill" tip="" @click="emit('material', 1)">
      +
    </GameButton>
  </li>
</template>

<style scoped>
.material {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 8);
}

.material .name {
  flex: 1;
}
</style>
