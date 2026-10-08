<script setup lang="ts">
import type { MenuIconGlyph } from "#src/models/menu/MenuIconGlyph";

import { getMenuGlyphStyle } from "#src/services/menu/getMenuGlyphStyle";

interface Props {
  // The icon as traced from the reference, its box placed in the reference's pixels from its parent's top left
  glyph: MenuIconGlyph;
}

const { glyph } = defineProps<Props>();
</script>

<template>
  <!-- One traced icon of the menu, drawn in the colour its parent sets, which its parent's own state fades with it -->
  <svg
    class="glyph"
    aria-hidden="true"
    :style="getMenuGlyphStyle(glyph)"
    :viewBox="`0 0 ${glyph.width} ${glyph.height}`"
  >
    <path v-for="(path, index) of glyph.paths" :key="index" :d="path" />
  </svg>
</template>

<style scoped>
.glyph {
  position: absolute;
  fill: currentColor;
  pointer-events: none;
}
</style>
