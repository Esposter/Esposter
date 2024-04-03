<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI/HealthBar/Container.vue";
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
</script>

<template>
  <Image :configuration="{ x, y, ...imageOrigin, texture: ImageKey.HealthBarRightCap, scaleY, tween }" />
</template>
