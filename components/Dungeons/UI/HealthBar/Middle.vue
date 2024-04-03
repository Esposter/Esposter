<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI/HealthBar/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface MiddleProps {
  imagePosition: ImagePosition;
  scaleY: number;
  displayWidth: number;
}

const { imagePosition, scaleY, displayWidth } = defineProps<MiddleProps>();
</script>

<template>
  <Image :configuration="{ ...imagePosition, texture: ImageKey.HealthBarMiddle, scaleY, displayWidth }" />
</template>
