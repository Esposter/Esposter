<script setup lang="ts">
import type { CloseButtonMark } from "#src/models/CloseButtonMark";

import { CloseButtonMarkGlyphMap } from "#src/services/CloseButtonMarkGlyphMap";

interface Props {
  // What the button does, for a screen reader, since it shows its own glyph alone
  label: string;
  // The glyph it draws over its disc
  mark: CloseButtonMark;
}

defineProps<Props>();
</script>

<template>
  <!-- The way out of a screen: a disc 58 units across at its top right, its fill and ring left to the screen that places
       it, and the mark its glyph draws over them in the same units. The ring is an inset shadow, not a border, so the
       mark's box is the disc's -->
  <button class="close-button" :aria-label="label" type="button">
    <svg class="mark" :viewBox="CloseButtonMarkGlyphMap[mark].viewBox" aria-hidden="true">
      <path :d="CloseButtonMarkGlyphMap[mark].path" />
    </svg>
  </button>
</template>

<style scoped>
.close-button {
  position: absolute;
  top: calc(var(--unit) * 19);
  right: calc(var(--unit) * 48);
  width: calc(var(--unit) * 58);
  height: calc(var(--unit) * 58);
  padding: 0;
  box-sizing: border-box;
  border-radius: 50%;
}

.mark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  fill: currentColor;
  pointer-events: none;
}
</style>
