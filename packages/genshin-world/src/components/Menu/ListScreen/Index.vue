<script setup lang="ts">
import type { GameText } from "genshin-text";
import type { VNode } from "vue";

import ScreenHeader from "#src/components/Menu/ScreenHeader/Index.vue";
import { GameScreen } from "genshin-interface";

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
    <ScreenHeader :game-text="gameText" :title="title" @close="emit('close')" />
    <slot name="tabs" />
    <span class="key previous">Q</span>
    <span class="key next">E</span>
    <slot name="list" />
    <slot name="detail" />
  </GameScreen>
</template>

<style scoped>
.list-screen {
  color: #fff;
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
