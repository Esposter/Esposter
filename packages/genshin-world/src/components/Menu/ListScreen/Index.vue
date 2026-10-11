<script setup lang="ts">
import type { GameText } from "genshin-text";
import type { VNode } from "vue";

import { GameScreen } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The screen's title in the reader's language
  title: string;
}

defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
defineSlots<{ detail: () => VNode; list: () => VNode; tabs?: () => VNode }>();
</script>

<template>
  <!-- A screen of the Paimon menu that lists its entries down the left, Q and E stepping between them, with the selected
       entry's detail on the right. The title and the close mark sit across the top, and a screen's own tabs, if it has
       Any, go along the top beside them -->
  <GameScreen class="list-screen">
    <p class="header-title">{{ title }}</p>
    <slot name="tabs" />
    <span class="key previous">Q</span>
    <span class="key next">E</span>
    <button class="close" :aria-label="gameText[GameTextKey.Back]" type="button" @click="emit('close')">×</button>
    <slot name="list" />
    <slot name="detail" />
  </GameScreen>
</template>

<style scoped>
.list-screen {
  color: #fff;
}

.header-title,
.close {
  margin: 0;
  border: none;
  cursor: inherit;
  font: inherit;
  font-weight: 600;
}

.header-title {
  position: absolute;
  top: 0;
  left: calc(var(--unit) * 144);
  height: calc(var(--unit) * 95);
  color: #d7c28f;
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 95);
}

.key {
  position: absolute;
  top: calc(var(--unit) * 33);
  display: grid;
  width: calc(var(--unit) * 32);
  height: calc(var(--unit) * 28);
  background: #ece5d8;
  color: #000;
  font-size: calc(var(--unit) * 20);
  place-items: center;
}

.key.previous {
  left: calc(var(--unit) * 675);
}

.key.next {
  left: calc(var(--unit) * 1213);
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

/* The list is its screen's own root element, so its ARIA role and label stay on it */
:slotted(.list) {
  position: absolute;
  top: calc(var(--unit) * 105);
  bottom: calc(var(--unit) * 125);
  left: calc(var(--unit) * 150);
  display: flex;
  width: calc(var(--unit) * 666);
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
}
</style>
