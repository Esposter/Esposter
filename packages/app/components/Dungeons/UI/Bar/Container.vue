<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import type { ImageConfiguration } from "@/lib/phaser/models/configuration/ImageConfiguration";
import type { Position } from "grid-engine";

export type ImagePosition = Pick<ImageConfiguration, "x" | "y" | "originX" | "originY">;

interface BarContainerProps {
  position: Position;
  width?: number;
  scaleY?: number;
  barPercentage: number;
}

const { position, width = 372, scaleY = 0.7, barPercentage } = defineProps<BarContainerProps>();
// Set origin to the middle-left of the health caps to enable
// grabbing the full width of the game object
const imageOrigin = { originX: 0, originY: 0.5 } as const satisfies Pick<ImagePosition, "originX" | "originY">;
</script>

<template>
  <Container :configuration="{ ...position }">
    <DungeonsUIBarShadow :image-position="{ ...position, ...imageOrigin }" :width :scale-y="scaleY" />
    <DungeonsUIBar
      :image-position="{ ...position, ...imageOrigin }"
      :width
      :scale-y="scaleY"
      :bar-percentage="barPercentage"
    />
  </Container>
</template>
