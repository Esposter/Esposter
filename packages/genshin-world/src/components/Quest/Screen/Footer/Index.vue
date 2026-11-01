<script setup lang="ts">
import type { GameText } from "genshin-text";

import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { QuestGlyph } from "#src/models/quest/QuestGlyph";
import { QUEST_DIVIDER_FILL } from "#src/services/quest/constants";
import { QuestGlyphMap } from "#src/services/quest/QuestGlyphMap";
import { OrnamentDivider } from "genshin-interface";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
}

defineProps<Props>();
</script>

<template>
  <span class="footer-line" />
  <div class="footer-rule">
    <OrnamentDivider :end-scale="0.8" :fill="QUEST_DIVIDER_FILL" is-hairline-hidden is-middle-hidden />
  </div>
  <!-- The overview of every quest is not built, so its button is drawn and does nothing -->
  <button class="quest-pill overview" type="button" disabled>
    <MenuGlyph :glyph="QuestGlyphMap[QuestGlyph.Overview]" />
    {{ gameText[GameTextKey.QuestOverview] }}
  </button>
</template>

<style scoped src="../../../../styles/questPill.css"></style>

<style scoped>
/* The shared divider's two ends, a little smaller than the divider's, at 29.5 in from each side of the screen and their
   centre 964 down, over the footer rule's own line */
.footer-rule {
  position: absolute;
  top: calc(var(--unit) * 949);
  right: calc(var(--unit) * 29.5);
  left: calc(var(--unit) * 29.5);
}

.footer-line {
  position: absolute;
  height: calc(var(--unit) * 2);
  top: calc(var(--unit) * 963);
  right: calc(var(--unit) * 30);
  left: calc(var(--unit) * 35);
  background: rgb(255 255 255 / 0.07);
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
