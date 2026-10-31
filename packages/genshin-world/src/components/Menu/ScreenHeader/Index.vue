<script setup lang="ts">
import type { GameText } from "genshin-text";

import { CloseButton, CloseButtonMark } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The glyph the close disc draws, the traced cross unless the screen's reference shows another
  mark?: CloseButtonMark;
  // The screen's title in the reader's language
  title: string;
}

const { mark = CloseButtonMark.Cross } = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
defineSlots<{ tabs?: () => VNode }>();
</script>

<template>
  <!-- The title across the top of a screen, its tabs if it has any, and the close mark at its right, placed against the
       screen's own box as a fragment so the screen keeps them as its children. The tabs come before the close mark in
       focus order, the WAI-ARIA order for a dialog's header -->
  <p class="title">{{ title }}</p>
  <slot name="tabs" />
  <CloseButton class="close" :label="gameText[GameTextKey.Back]" :mark @click="emit('close')" />
</template>

<style scoped>
.title,
.close {
  margin: 0;
  border: none;
  cursor: inherit;
  font: inherit;
  font-weight: 600;
}

.title {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 144);
  height: calc(var(--unit) * 95);
  color: #d0bf9f;
  font-size: calc(var(--unit) * 27);
  line-height: calc(var(--unit) * 95);
}

/* A cream disc in a grey ring, the ring an inset shadow so the close button's mark sits in the disc's own box */
.close {
  background: #ece5d7;
  box-shadow: inset 0 0 0 calc(var(--unit) * 6) #878789;
  color: #3a4050;
}
</style>
