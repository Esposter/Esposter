<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The screen's title in the game's words
  title: string;
}

const { gameText, title } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const backButton = useTemplateRef("backButton");
// The screen is a dialog over the world, so focus starts inside it
onMounted(() => {
  backButton.value?.focus();
});
</script>

<template>
  <!-- A screen the world does not have yet, opened all the same so its shortcut and its way back work as the game's:
       Its title over the world, veiled as a menu veils it, and the way back -->
  <GameScreen class="menu-placeholder" role="dialog" aria-modal="true" :aria-label="title">
    <p class="title" role="heading" aria-level="2">{{ title }}</p>
    <button ref="backButton" class="back" type="button" @click="emit('close')">
      {{ gameText[GameTextKey.Back] }}
    </button>
  </GameScreen>
</template>

<style scoped>
/* Provisional: a placeholder has no screen of the game's to be measured against, so its veil, sizes and colours are
   The Paimon menu's own provisional ones */
.menu-placeholder {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: calc(var(--unit) * 32);
  background: rgb(20 24 36 / 0.7);
  color: #ece5d8;
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 48);
}

.back {
  padding: calc(var(--unit) * 12) calc(var(--unit) * 40);
  border: calc(var(--unit) * 2) solid #ece5d8;
  border-radius: calc(var(--unit) * 28);
  background: none;
  color: inherit;
  cursor: inherit;
  font: inherit;
  font-size: calc(var(--unit) * 26);
}

.back:hover,
.back:focus-visible {
  outline: none;
  background: #ece5d8;
  color: #3b4255;
}
</style>
