<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI//Container.vue";
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface LeftCapProps {
  imagePosition: ImagePosition;
  scaleY: number;
}

const { imagePosition, scaleY } = defineProps<LeftCapProps>();
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
const isVisible = computed(() => (displayWidth.value ?? 0) > 0);
</script>

<template>
  <Image
    :configuration="{ visible: isVisible, ...imagePosition, texture: ImageKey.LeftCap, displayWidth, scaleY }"
    @update:display-width="(value: typeof displayWidth) => (displayWidth = value)"
  />
</template>
