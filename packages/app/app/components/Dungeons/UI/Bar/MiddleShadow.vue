<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";
import { Image } from "vue-phaserjs";

interface MiddleShadowProps {
  displayWidth: number;
  imagePosition: ImagePosition;
  scaleY: number;
}

const { displayWidth, imagePosition, scaleY } = defineProps<MiddleShadowProps>();
</script>

<template>
  <Image :configuration="{ ...imagePosition, texture: ImageKey.BarMiddleShadow, scaleY, displayWidth }" />
</template>
