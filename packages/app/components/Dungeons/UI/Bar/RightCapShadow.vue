<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI//Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
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
    :configuration="{ ...imagePosition, texture: ImageKey.RightCapShadow, displayWidth, scaleY }"
    @update:display-width="(value: typeof displayWidth) => (displayWidth = value)"
  />
</template>
