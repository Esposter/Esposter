<script setup lang="ts">
import type { GameText } from "genshin-text";

import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
const emit = defineEmits<{ press: [] }>();
</script>

<template>
  <!-- The HUD's corner button that opens the Paimon menu, as Escape does, named for a screen reader since it shows a
       Mark alone -->
  <button class="paimon-button" type="button" :aria-label="gameText[GameTextKey.Paimon]" @click="emit('press')" />
</template>

<style scoped>
/* Provisional: the button's size, colours and Paimon's mark, traced and measured off a recording of the English PC
   Client's world HUD */
.paimon-button {
  width: calc(var(--unit) * 64);
  height: calc(var(--unit) * 64);
  padding: 0;
  border: calc(var(--unit) * 3) solid rgb(236 229 216 / 0.9);
  border-radius: 50%;
  background: radial-gradient(circle at 50% 40%, #fdfdfd 0 35%, #c9d6e8 36% 100%);
  box-shadow: 0 0 calc(var(--unit) * 4) rgb(0 0 0 / 0.4);
  cursor: inherit;
  pointer-events: auto;
}
</style>
