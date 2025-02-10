<script setup lang="ts">
import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { TweenBuilderConfiguration } from "vue-phaserjs";

import { Image } from "vue-phaserjs";

interface RightCapProps {
  imagePosition: ImagePosition;
  scaleY: number;
  texture: FileKey;
  tween?: TweenBuilderConfiguration;
}

const { imagePosition, scaleY, texture, tween } = defineProps<RightCapProps>();
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
const isVisible = computed(() => (displayWidth.value ?? 0) > 0);
</script>

<template>
  <Image
    :configuration="{ visible: isVisible, ...imagePosition, texture, displayWidth, scaleY, tween }"
    @update:display-width="(value: typeof displayWidth) => (displayWidth = value)"
  />
</template>
