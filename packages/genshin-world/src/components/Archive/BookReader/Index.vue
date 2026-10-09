<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

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
    <p class="title">{{ title }}</p>
    <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">×</button>
    <p class="body">{{ body }}</p>
  </GameScreen>
</template>

<style scoped>
.book-reader-screen {
  color: #fff;
}

.title,
.close,
.body {
  margin: 0;
  border: none;
  cursor: inherit;
  font: inherit;
}

.title {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 144);
  height: calc(var(--unit) * 95);
  color: #d7c28f;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  line-height: calc(var(--unit) * 95);
}

.close {
  position: absolute;
  top: calc(var(--unit) * 19);
  right: calc(var(--unit) * 50);
  width: calc(var(--unit) * 56);
  height: calc(var(--unit) * 56);
  border-radius: calc(var(--unit) * 6);
  background: rgb(236 229 216 / 0.85);
  color: #3b4255;
  font-size: calc(var(--unit) * 40);
  line-height: 1;
}

.body {
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
