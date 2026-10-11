<script setup lang="ts">
import type { GameText } from "genshin-text";

import ScreenHeader from "#src/components/Menu/ScreenHeader/Index.vue";
import { GameScreen } from "genshin-interface";

interface Props {
  // The volume's text in the reader's language, its lines kept as the game breaks them
  body: string;
  // The game's words in the reader's language
  gameText: GameText;
  // The volume's title in the reader's language
  title: string;
}

const { body, gameText, title } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <!-- A volume the Archive's Books section opens: its title across the top and its text on one page, as the game's reader
       sets it. Provisional: its size, place and colours wait on the parity pass against a recording of the English client's
       reader, the search for one having found none -->
  <GameScreen class="book-reader-screen">
    <ScreenHeader :game-text="gameText" :title="title" @close="emit('close')" />
    <p class="body">{{ body }}</p>
  </GameScreen>
</template>

<style scoped>
.book-reader-screen {
  color: #fff;
}

.body {
  margin: 0;
  border: none;
  cursor: inherit;
  font: inherit;
  position: absolute;
  top: calc(var(--unit) * 105);
  right: calc(var(--unit) * 144);
  bottom: calc(var(--unit) * 60);
  left: calc(var(--unit) * 144);
  overflow-y: auto;
  font-size: calc(var(--unit) * 18);
  line-height: 1.6;
  white-space: pre-line;
}
</style>
