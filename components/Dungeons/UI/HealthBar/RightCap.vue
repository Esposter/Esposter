<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface RightCapProps {
  y: number;
  scaleY: number;
  tween?: TweenBuilderConfiguration;
}

const { y, scaleY, tween } = defineProps<RightCapProps>();
const x = defineModel<number | undefined>("x", { required: true });
</script>

<template>
  <Image
    :configuration="{
      x,
      y,
      texture: ImageKey.HealthBarRightCap,
      originX: 0,
      originY: 0.5,
      scaleY,
      tween,
    }"
  />
</template>
