<script setup lang="ts">
import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

import { Image } from "vue-phaserjs";

interface Props {
  displayWidth?: number;
  imagePosition: ImagePosition;
  // The bar's own segments disappear as they empty, while the shadow behind them is always drawn
  isHiddenWhenEmpty?: true;
  scaleY: number;
  texture: FileKey;
}

const { displayWidth, imagePosition, isHiddenWhenEmpty, scaleY, texture } = defineProps<Props>();
const emit = defineEmits<{ "update:displayWidth": [value?: number] }>();
</script>

<template>
  <Image
    :configuration="{
      visible: !isHiddenWhenEmpty || (displayWidth ?? 0) > 0,
      ...imagePosition,
      texture,
      displayWidth,
      scaleY,
    }"
    @update:display-width="emit('update:displayWidth', $event)"
  />
</template>
