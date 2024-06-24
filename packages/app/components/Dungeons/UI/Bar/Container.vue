<script setup lang="ts">
import Container from "@/lib/phaser/components/Container.vue";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { BarType } from "@/models/dungeons/UI/bar/BarType";
import type { Position } from "grid-engine";
import type { Tweens } from "phaser";

interface BarContainerProps {
  type: BarType;
  position: Position;
  width?: number;
  scaleY?: number;
  barPercentage: number;
}

const { type, position, width = 372, scaleY = 0.7, barPercentage } = defineProps<BarContainerProps>();
const emit = defineEmits<{
  "start:display-width": [tween: Tweens.Tween];
  "update:display-width": [value: number];
  "complete:display-width": [];
}>();
// Set origin to the middle-left of the health caps to enable
// grabbing the full width of the game object
const imageOrigin = { originX: 0, originY: 0.5 } as const satisfies Pick<ImagePosition, "originX" | "originY">;
</script>

<template>
  <Container :configuration="{ ...position }">
    <DungeonsUIBarShadow :image-position="{ ...position, ...imageOrigin }" :width :scale-y="scaleY" />
    <DungeonsUIBar
      :type
      :image-position="{ ...position, ...imageOrigin }"
      :width
      :scale-y="scaleY"
      :bar-percentage="barPercentage"
      @start:display-width="(...args) => emit('start:display-width', ...args)"
      @update:display-width="(...args) => emit('update:display-width', ...args)"
      @complete:display-width="emit('complete:display-width')"
    />
  </Container>
</template>
