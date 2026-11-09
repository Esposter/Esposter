<script setup lang="ts">
import { GameButton, GameButtonKind } from "genshin-interface";

interface Props {
  // The name the set-birthday button is labelled by for assistive technology, in the reader's language
  label: string;
}

defineProps<Props>();
const emit = defineEmits<{ open: [] }>();
</script>

<template>
  <GameButton :aria-label="label" :kind="GameButtonKind.Plain" tip="" @click="emit('open')"> -/- </GameButton>
</template>
