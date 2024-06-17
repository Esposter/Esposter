<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI/Bar/Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface LeftCapShadowProps {
  imagePosition: ImagePosition;
  scaleY: number;
}

const { imagePosition, scaleY } = defineProps<LeftCapShadowProps>();
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
</script>

<template>
  <Image
    :configuration="{ ...imagePosition, texture: ImageKey.BarLeftCapShadow, scaleY, displayWidth }"
    @update:display-width="(value: typeof displayWidth) => (displayWidth = value)"
  />
</template>
