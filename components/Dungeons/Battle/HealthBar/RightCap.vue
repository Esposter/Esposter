<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type Position } from "grid-engine";

interface RightCapProps {
  position: Position;
  scaleY: number;
}

const { position, scaleY } = defineProps<RightCapProps>();
</script>

<template>
  <Image
    :configuration="{
      ...position,
      textureKey: TextureManagerKey.HealthBarRightCap,
      originX: 0,
      originY: 0.5,
      scaleY,
    }"
  />
</template>
