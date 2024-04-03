<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI/HealthBar/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface MiddleShadowProps {
  imagePosition: ImagePosition;
  scaleY: number;
  displayWidth: number;
}

const { imagePosition, scaleY, displayWidth } = defineProps<MiddleShadowProps>();
</script>

<template>
  <Image :configuration="{ ...imagePosition, texture: ImageKey.HealthBarMiddleShadow, scaleY, displayWidth }" />
</template>
