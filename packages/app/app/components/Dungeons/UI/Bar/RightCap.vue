<script setup lang="ts">
import type { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { TweenBuilderConfiguration } from "vue-phaserjs";

import { Image } from "vue-phaserjs";

interface RightCapProps {
  imagePosition: ImagePosition;
  scaleY: number;
  texture: ImageKey;
  tween?: TweenBuilderConfiguration;
}

const { imagePosition, scaleY, texture, tween } = defineProps<RightCapProps>();
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
const isVisible = computed(() => (displayWidth.value ?? 0) > 0);
</script>

<template>
  <Image
    :configuration="{ visible: isVisible, ...imagePosition, texture, displayWidth, scaleY, tween }"
    @update:display-width="displayWidth = $event"
  />
</template>
