<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { BarType } from "@/models/dungeons/UI/bar/BarType";
import type { Position } from "grid-engine";
import type { Tweens } from "phaser";

import { clamp } from "@vueuse/core";
import { Container } from "vue-phaserjs";

interface BarContainerProps {
  barPercentage: number;
  isSkipAnimations?: boolean;
  position: Position;
  scaleY?: number;
  type: BarType;
  width?: number;
}

const {
  barPercentage: baseBarPercentage,
  isSkipAnimations,
  position,
  scaleY = 0.7,
  type,
  width = 372,
} = defineProps<BarContainerProps>();
const emit = defineEmits<{
  "complete:display-width": [];
  "start:display-width": [tween: Tweens.Tween];
  "update:display-width": [value: number];
}>();
const barPercentage = computed(() => clamp(baseBarPercentage, 0, 100));
// Set origin to the middle-left of the health caps to enable
// grabbing the full width of the game object
const imageOrigin = { originX: 0, originY: 0.5 } as const satisfies Pick<ImagePosition, "originX" | "originY">;
</script>

<template>
  <Container :configuration="{ ...position }">
    <DungeonsUIBarShadow :image-position="{ ...position, ...imageOrigin }" :width :scale-y />
    <DungeonsUIBar
      :type
      :image-position="{ ...position, ...imageOrigin }"
      :width
      :scale-y
      :bar-percentage
      :is-skip-animations
      @start:display-width="(...args) => emit('start:display-width', ...args)"
      @update:display-width="(...args) => emit('update:display-width', ...args)"
      @complete:display-width="emit('complete:display-width')"
    />
  </Container>
</template>
