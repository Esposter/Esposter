<script setup lang="ts">
import type { GameText } from "genshin-text";
import type { VNode } from "vue";

import ScreenHeader from "#src/components/Menu/ScreenHeader/Index.vue";
import { ScreenHeaderMark } from "#src/models/menu/ScreenHeaderMark";
import { LIST_SCREEN_WIDTH } from "#src/services/menu/constants";
import { GameScreen } from "genshin-interface";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The glyph the close mark draws, a cross unless the screen's reference shows another
  mark?: ScreenHeaderMark;
  // The screen's title in the reader's language
  title: string;
  // Whether the world behind the screen is blurred and washed, which the screen opts into
  isWorldBlurred?: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
defineSlots<{ detail: () => VNode; icon?: () => VNode; list: () => VNode; tabs?: () => VNode }>();
</script>

<template>
  <!-- A screen of the Paimon menu that lists its entries down the left, with the selected entry's detail on the right.
       The title and the close mark sit across the top on a translucent band, with the Q and E keys either side of its
       tabs, which each screen steps with `useListScreenTabStep`. A screen's
       own icon before the title and its own tabs, if it has any, along the band beside them -->
  <GameScreen class="list-screen" :is-world-blurred="isWorldBlurred">
    <span class="band" />
    <slot name="icon" />
    <ScreenHeader :game-text :mark :title @close="emit('close')">
      <template #tabs>
        <slot name="tabs" />
      </template>
    </ScreenHeader>
    <span class="key previous">Q</span>
    <span class="key next">E</span>
    <slot name="list" />
    <slot name="detail" />
  </GameScreen>
</template>

<style scoped>
/* Its marks are traced off the quest screen's still at 1920 by 1080, one of its pixels a unit */
.list-screen {
  --reference-pixel: var(--unit);
  color: #fff;
}

/* The band across the top, the world darkened under it as the quest screen's still has it: its fill fitted against
   The world just under its edge, over the still's width clear of the tabs */
.band {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: calc(var(--unit) * 95);
  background: rgb(30 29 45 / 0.4);
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
  width: calc(var(--unit) * v-bind(LIST_SCREEN_WIDTH));
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
}
</style>
