<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { BarType } from "@/models/dungeons/UI/bar/BarType";
import type { Position } from "grid-engine";

interface BarContainerProps {
  type: BarType;
  position: Position;
  width?: number;
  scaleY?: number;
  barPercentage: number;
}

const { type, position, width = 372, scaleY = 0.7, barPercentage } = defineProps<BarContainerProps>();
// Set origin to the middle-left of the health caps to enable
// grabbing the full width of the game object
const imageOrigin = { originX: 0, originY: 0.5 } as const satisfies Pick<ImagePosition, "originX" | "originY">;
</script>

<template>
  <Container :configuration="{ ...position }">
    <DungeonsUIBarShadow :image-position="{ ...position, ...imageOrigin }" :width :scale-y="scaleY" />
    <DungeonsUIBar :type :image-position="{ ...position, ...imageOrigin }" :width :scale-y="scaleY" :bar-percentage="barPercentage" />
  </Container>
</template>
