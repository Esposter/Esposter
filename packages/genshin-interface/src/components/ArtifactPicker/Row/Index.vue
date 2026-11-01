<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The caption the option shows under its name
  caption: string;
  // The artifact's name in the reader's language
  name: string;
  // Its rarity in stars, which the option carries as its data-rarity
  rarity: number;
}

const { caption, name, rarity } = defineProps<Props>();
const emit = defineEmits<{ choose: [] }>();
</script>

<template>
  <GameButton class="option" :data-rarity="rarity" :kind="GameButtonKind.Row" tip="" @click="emit('choose')">
    <span class="name">{{ name }}</span>
    <span class="caption">{{ caption }}</span>
  </GameButton>
</template>

<style scoped>
.option {
  padding: calc(var(--unit) * 12) calc(var(--unit) * 16);
}
</style>

<style scoped src="../../../styles/artifactPicker.css"></style>
