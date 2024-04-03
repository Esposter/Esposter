<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI/HealthBar/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface RightCapShadowProps {
  imagePosition: ImagePosition;
  scaleY: number;
}

const { imagePosition, scaleY } = defineProps<RightCapShadowProps>();
</script>

<template>
  <Image :configuration="{ ...imagePosition, texture: ImageKey.HealthBarRightCapShadow, scaleY }" />
</template>
