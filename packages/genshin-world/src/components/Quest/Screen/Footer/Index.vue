<script setup lang="ts">
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { QuestGlyph } from "#src/models/quest/QuestGlyph";
import { ORNAMENT_END_SIDES } from "#src/services/quest/constants";
import { QuestGlyphMap } from "#src/services/quest/QuestGlyphMap";
import { ORNAMENT_END_PATH } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

defineProps<Props>();
</script>

<template>
  <span class="footer-line" />
  <svg v-for="side of ORNAMENT_END_SIDES" :key="side" class="footer-end" :class="side" viewBox="0 0 320 224">
    <path :d="ORNAMENT_END_PATH" />
  </svg>
  <!-- The overview of every quest is not built, so its button is drawn and does nothing -->
  <button class="pill overview" type="button" disabled>
    <MenuGlyph :glyph="QuestGlyphMap[QuestGlyph.Overview]" />
    {{ gameText[GameTextKey.QuestOverview] }}
  </button>
</template>

<style scoped>
/* The game's tapered diamond at each end of the footer rule, the flipped one at the right */
.footer-end {
  position: absolute;
  top: calc(var(--unit) * 955.5);
  left: calc(var(--unit) * 29.5);
  width: calc(var(--unit) * 24);
  height: calc(var(--unit) * 17);
  fill: rgb(255 255 255 / 0.3);
}

/* The footer rule's ends, a little smaller than the divider's */
.footer-end.right {
  left: auto;
  right: calc(var(--unit) * 29.5);
  scale: -1 1;
}

.footer-line {
  position: absolute;
  height: calc(var(--unit) * 2);
  top: calc(var(--unit) * 963);
  right: calc(var(--unit) * 30);
  left: calc(var(--unit) * 35);
  background: rgb(255 255 255 / 0.07);
}

/* The navigating pill in Detail takes the same base: the two sit in different boxes, so each carries its own copy */
.pill {
  margin: 0;
  padding: 0;
  border: none;
  cursor: inherit;
  font: inherit;
  font-weight: 600;
  position: absolute;
  top: calc(var(--unit) * 989);
  width: calc(var(--unit) * 288);
  height: calc(var(--unit) * 62);
  border-radius: calc(var(--unit) * 31);
  background: #ece5d7;
  color: #3c404b;
  font-size: calc(var(--unit) * 27);
}

/* Its capitals' tops 20.5 below the pill's, its words spaced out to the still's width */
.overview {
  left: calc(var(--unit) * 144);
  padding-left: calc(var(--unit) * 59);
  color: #3a414e;
  letter-spacing: calc(var(--unit) * 1.8);
  line-height: calc(var(--unit) * 62);
  text-align: start;
}
</style>
