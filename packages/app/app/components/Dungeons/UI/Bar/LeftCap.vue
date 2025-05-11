<script setup lang="ts">
import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

import { Image } from "vue-phaserjs";

interface LeftCapProps {
  imagePosition: ImagePosition;
  scaleY: number;
  texture: FileKey;
}

const { imagePosition, scaleY, texture } = defineProps<LeftCapProps>();
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
const isVisible = computed(() => (displayWidth.value ?? 0) > 0);
</script>

<template>
  <Image
    :configuration="{ visible: isVisible, ...imagePosition, texture, displayWidth, scaleY }"
    @update:display-width="(value) => (displayWidth = value)"
  />
</template>
