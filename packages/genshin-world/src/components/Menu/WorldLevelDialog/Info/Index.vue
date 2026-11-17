<script setup lang="ts">
import type { GameText } from "genshin-text";

import MenuScrollTrack from "#src/components/Menu/ScrollTrack/Index.vue";
import { useScrollThumb } from "#src/composables/useScrollThumb";
import { GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The game's words in the reader's language, which the help text is read from
  gameText: GameText;
}

const { gameText } = defineProps<Props>();
const body = useTemplateRef("body");
const info = useTemplateRef("info");
const infoSegments = computed(() => splitGameTextColors(gameText[GameTextKey.WorldLevelInfo]));
const { scrollThumb, updateScrollThumb } = useScrollThumb(body, info, { isReversed: true });
</script>

<template>
  <!-- Focusable, so a keyboard scrolls back up the help text it opens at the end of -->
  <div
    ref="body"
    class="body"
    role="region"
    :aria-label="gameText[GameTextKey.WorldLevel]"
    tabindex="0"
    @scroll="updateScrollThumb()"
  >
    <p ref="info" class="info">
      <span v-for="({ color, text }, index) of infoSegments" :key="index" :style="{ color }">{{ text }}</span>
    </p>
  </div>
  <MenuScrollTrack class="track" :offset="scrollThumb.offset" :share="scrollThumb.share" />
  <svg class="caret up" aria-hidden="true" viewBox="0 0 10 5"><polyline points="1 4.25 5 0.75 9 4.25" /></svg>
  <svg class="caret down" aria-hidden="true" viewBox="0 0 10 5"><polyline points="1 0.75 5 4.25 9 0.75" /></svg>
</template>

<style scoped>
/* The body scrolls from its end, where the game opens it, so a column laid out in reverse starts there; its lines are
   The recording's 32 units apart at a cap height of 20, spaced out to its lines' widths, and its last line's box ends
   23.5 units above the track's foot */
.body {
  position: absolute;
  top: calc(var(--unit) * 90);
  left: calc(var(--unit) * 76);
  display: flex;
  width: calc(var(--unit) * 917);
  height: calc(var(--unit) * 478);
  flex-direction: column-reverse;
  overflow-y: auto;
  scrollbar-width: none;
}

.info {
  margin: 0 0 auto;
  padding-bottom: calc(var(--unit) * 23.5);
  color: #e3e4e6;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
  letter-spacing: 0.057em;
  line-height: calc(var(--unit) * 32);
  white-space: pre-line;
}

.track {
  top: calc(var(--unit) * 105);
  left: calc(var(--unit) * 1021);
  width: calc(var(--unit) * 5);
  height: calc(var(--unit) * 463);
  background: #383d4e;
}

.track :deep(.thumb) {
  left: 0;
  width: calc(var(--unit) * 6);
  background: #beb9b9;
}

.caret {
  position: absolute;
  left: calc(var(--unit) * 1018.5);
  width: calc(var(--unit) * 10);
  height: calc(var(--unit) * 5);
  fill: none;
  stroke: #5e6472;
  stroke-width: 1.5;
}

.caret.up {
  top: calc(var(--unit) * 98);
}

.caret.down {
  top: calc(var(--unit) * 569.5);
}
</style>
