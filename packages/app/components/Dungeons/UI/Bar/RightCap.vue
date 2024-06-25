<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface RightCapProps {
  imagePosition: ImagePosition;
  texture: ImageKey;
  scaleY: number;
  tween?: TweenBuilderConfiguration;
}

const { imagePosition, texture, scaleY, tween } = defineProps<RightCapProps>();
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
const isVisible = computed(() => (displayWidth.value ?? 0) > 0);
</script>

<template>
  <Image
    :configuration="{ visible: isVisible, ...imagePosition, texture, displayWidth, scaleY, tween }"
    @update:display-width="(value: typeof displayWidth) => (displayWidth = value)"
  />
</template>
