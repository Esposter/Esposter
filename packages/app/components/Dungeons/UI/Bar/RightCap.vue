<script setup lang="ts">
import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

import Image from "@/lib/phaser/components/Image.vue";

interface RightCapProps {
  imagePosition: ImagePosition;
  scaleY: number;
  texture: ImageKey;
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
