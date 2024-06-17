<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI//Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface RightCapProps {
  y: number;
  imageOrigin: Pick<ImagePosition, "originX" | "originY">;
  scaleY: number;
  tween?: TweenBuilderConfiguration;
}

const { y, imageOrigin, scaleY, tween } = defineProps<RightCapProps>();
const x = defineModel<number | undefined>("x", { required: true });
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
const isVisible = computed(() => (displayWidth.value ?? 0) > 0);
</script>

<template>
  <Image
    :configuration="{
      visible: isVisible,
      x,
      y,
      ...imageOrigin,
      texture: ImageKey.RightCap,
      displayWidth,
      scaleY,
      tween,
    }"
    @update:display-width="(value: typeof displayWidth) => (displayWidth = value)"
  />
</template>
