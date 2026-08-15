<script setup lang="ts">
import type { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

import { Image } from "vue-phaserjs";

interface BarImageProps {
  displayWidth?: number;
  imagePosition: ImagePosition;
  // The bar's own segments disappear as they empty, while the shadow behind them is always drawn
  isHiddenWhenEmpty?: true;
  scaleY: number;
  texture: ImageKey;
}

const { displayWidth, imagePosition, isHiddenWhenEmpty, scaleY, texture } = defineProps<BarImageProps>();
const emit = defineEmits<{ "update:displayWidth": [value?: number] }>();
const visible = computed(() => !isHiddenWhenEmpty || (displayWidth ?? 0) > 0);
</script>

<template>
  <Image
    :configuration="{ visible, ...imagePosition, texture, displayWidth, scaleY }"
    @update:display-width="emit('update:displayWidth', $event)"
  />
</template>
