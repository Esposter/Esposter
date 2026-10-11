<script setup lang="ts">
import type { GlyphLayer } from "#src/models/hud/GlyphLayer";

interface Props {
  // The glyph's tones, each a path on its 128 unit square drawn in its share of the fill the button gives it
  glyphLayers: readonly GlyphLayer[];
}

const { glyphLayers } = defineProps<Props>();
</script>

<template>
  <!-- A HUD button's glyph, its tones laid over one another in order -->
  <svg aria-hidden="true" viewBox="0 0 128 128">
    <path v-for="{ opacity, path } of glyphLayers" :key="path" fill-rule="evenodd" :fill-opacity="opacity" :d="path" />
  </svg>
</template>

<style scoped>
/* A glyph is centred on its button's disc, its side a share of the disc set by the button */
.glyph {
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--glyph-size);
  height: var(--glyph-size);
  fill: #fff;
  pointer-events: none;
  translate: -50% -50%;
}
</style>
