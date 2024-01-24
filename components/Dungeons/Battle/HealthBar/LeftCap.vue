<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type Position } from "grid-engine";

interface LeftCapProps {
  position: Position;
  scaleY: number;
}

const { position, scaleY } = defineProps<LeftCapProps>();
</script>

<template>
  <Image
    :configuration="{
      ...position,
      textureKey: TextureManagerKey.HealthBarLeftCap,
      // Set origin to the middle-left of the health caps to enable
      // grabbing the full width of the game object
      originX: 0,
      originY: 0.5,
      scaleY,
    }"
  />
</template>
