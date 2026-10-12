<script setup lang="ts">
import type { MenuIconGlyph } from "#src/models/menu/MenuIconGlyph";

interface Props {
  glyph: MenuIconGlyph;
}

const { glyph } = defineProps<Props>();
</script>

<template>
  <!-- A traced icon's paths in the svg its parent sizes: its paler tones first, each in its share of the fill, and its
       White over them -->
  <path
    v-for="{ opacity, path } of glyph.paleLayers ?? []"
    :key="path"
    fill-rule="evenodd"
    :fill-opacity="opacity"
    :d="path"
  />
  <path v-for="(path, index) of glyph.paths" :key="index" :d="path" />
</template>
