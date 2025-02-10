<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { Image } from "vue-phaserjs";

interface LeftCapShadowProps {
  imagePosition: ImagePosition;
  scaleY: number;
}

const { imagePosition, scaleY } = defineProps<LeftCapShadowProps>();
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
</script>

<template>
  <Image
    :configuration="{
      ...imagePosition,
      texture: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowLeft,
      scaleY,
      displayWidth,
    }"
    @update:display-width="(value: typeof displayWidth) => (displayWidth = value)"
  />
</template>
