<script setup lang="ts">
import type { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import type { ImagePosition } from "#src/models/dungeons/ImagePosition";

import { BarOrigin } from "#src/models/dungeons/UI/bar/BarOrigin";

interface Props {
  imagePosition: ImagePosition;
  isHiddenWhenEmpty?: true | undefined;
  middleDisplayWidth?: number | undefined;
  scaleY: number;
  textures: Record<BarOrigin, ImageKey>;
}

const leftCapDisplayWidth = defineModel<number | undefined>("leftCapDisplayWidth");
const rightCapDisplayWidth = defineModel<number | undefined>("rightCapDisplayWidth");
const { imagePosition, middleDisplayWidth } = defineProps<Props>();
// Each segment begins where the one before it ends. The caps report their own texture's width back through
// Their models, so the offsets are read off the rendered images rather than declared anywhere
const middleX = computed(() => imagePosition.x + (leftCapDisplayWidth.value ?? 0));
// Computed so a segment keeps its position object until its own x moves, rather than receiving a new one every render
const middleImagePosition = computed(() => ({ ...imagePosition, x: middleX.value }));
const rightImagePosition = computed(() => ({ ...imagePosition, x: middleX.value + (middleDisplayWidth ?? 0) }));
</script>

<template>
  <DungeonsUIBarImage
    v-model:display-width="leftCapDisplayWidth"
    :image-position
    :texture="textures[BarOrigin.Left]"
    :scale-y
    :is-hidden-when-empty
  />
  <DungeonsUIBarImage
    :image-position="middleImagePosition"
    :display-width="middleDisplayWidth"
    :texture="textures[BarOrigin.Middle]"
    :scale-y
    :is-hidden-when-empty
  />
  <DungeonsUIBarImage
    v-model:display-width="rightCapDisplayWidth"
    :image-position="rightImagePosition"
    :texture="textures[BarOrigin.Right]"
    :scale-y
    :is-hidden-when-empty
  />
</template>
