<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface RightCapShadowProps {
  imagePosition: ImagePosition;
  scaleY: number;
}

const { imagePosition, scaleY } = defineProps<RightCapShadowProps>();
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
</script>

<template>
  <Image
    :configuration="{ ...imagePosition, texture: ImageKey.BarRightCapShadow, displayWidth, scaleY }"
    @update:display-width="(value: typeof displayWidth) => (displayWidth = value)"
  />
</template>
