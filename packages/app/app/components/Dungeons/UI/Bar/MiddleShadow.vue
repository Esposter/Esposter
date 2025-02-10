<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { Image } from "vue-phaserjs";

interface MiddleShadowProps {
  displayWidth: number;
  imagePosition: ImagePosition;
  scaleY: number;
}

const { displayWidth, imagePosition, scaleY } = defineProps<MiddleShadowProps>();
</script>

<template>
  <Image
    :configuration="{
      ...imagePosition,
      texture: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowMid,
      scaleY,
      displayWidth,
    }"
  />
</template>
