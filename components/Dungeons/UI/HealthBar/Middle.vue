<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI/HealthBar/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface MiddleProps {
  imagePosition: ImagePosition;
  displayWidth: number;
  scaleY: number;
  tween?: TweenBuilderConfiguration;
}

const { imagePosition, displayWidth, scaleY, tween } = defineProps<MiddleProps>();
</script>

<template>
  <Image :configuration="{ ...imagePosition, texture: ImageKey.HealthBarMiddle, displayWidth, scaleY, tween }" />
</template>
