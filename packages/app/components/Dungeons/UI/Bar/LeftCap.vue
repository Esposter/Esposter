<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface LeftCapProps {
  imagePosition: ImagePosition;
  texture: ImageKey;
  scaleY: number;
}

const { imagePosition, texture, scaleY } = defineProps<LeftCapProps>();
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
const isVisible = computed(() => (displayWidth.value ?? 0) > 0);
</script>

<template>
  <Image
    :configuration="{ visible: isVisible, ...imagePosition, texture, displayWidth, scaleY }"
    @update:display-width="(value: typeof displayWidth) => (displayWidth = value)"
  />
</template>
