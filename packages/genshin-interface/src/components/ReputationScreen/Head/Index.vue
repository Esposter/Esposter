<script setup lang="ts">
import { GAME_ROW_HOVER, GAME_ROW_PRESS } from "#src/services/constants";

interface Props {
  // The way back to the world in the reader's language
  backLabel: string;
  // The title the game shows over the page, its nation's name filled in
  title: string;
}

const { backLabel, title } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <header class="head">
    <p class="title" role="heading" aria-level="1">{{ title }}</p>
    <button class="back gradient-tint" :aria-label="backLabel" type="button" @click="emit('close')">↶</button>
  </header>
</template>

<style scoped>
/* The head: the title on two lines 250 wide past the emblem's place, the way back a 58 circle at the corner */
.head {
  position: absolute;
  top: calc(var(--unit) * 19);
  left: calc(var(--unit) * 137);
  right: calc(var(--unit) * 48);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #f1e6c6;
}

.title {
  width: calc(var(--unit) * 250);
  margin: 0;
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 27);
}

.back {
  width: calc(var(--unit) * 58);
  height: calc(var(--unit) * 58);
  border: calc(var(--unit) * 4) solid rgb(128 128 128 / 0.7);
  border-radius: 50%;
  background: #ece8df;
  color: #33333a;
  --tint-hover: v-bind(GAME_ROW_HOVER);
  --tint-press: v-bind(GAME_ROW_PRESS);
  font: inherit;
  font-size: calc(var(--unit) * 30);
}
</style>

<style scoped src="../../../styles/gradientTint.css"></style>
