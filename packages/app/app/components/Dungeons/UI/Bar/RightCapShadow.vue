<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { Image } from "vue-phaserjs";

interface RightCapShadowProps {
  imagePosition: ImagePosition;
  scaleY: number;
}

const { imagePosition, scaleY } = defineProps<RightCapShadowProps>();
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
</script>

<template>
  <Image
    :configuration="{
      ...imagePosition,
      texture: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowRight,
      displayWidth,
      scaleY,
    }"
    @update:display-width="(value) => (displayWidth = value)"
  />
</template>
