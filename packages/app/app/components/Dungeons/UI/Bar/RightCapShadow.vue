<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { Image } from "vue-phaserjs";

interface RightCapShadowProps {
  imagePosition: ImagePosition;
  scaleY: number;
}

const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
const { imagePosition, scaleY } = defineProps<RightCapShadowProps>();
</script>

<template>
  <Image
    :configuration="{
      ...imagePosition,
      texture: FileKey.ThirdPartyKenneysAssetsUISpaceExpansionBarHorizontalShadowRight,
      displayWidth,
      scaleY,
    }"
    @update:display-width="displayWidth = $event"
  />
</template>
