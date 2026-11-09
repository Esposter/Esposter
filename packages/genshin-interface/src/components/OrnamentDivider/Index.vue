<script setup lang="ts">
import { ORNAMENT_END_PATH, ORNAMENT_MIDDLE_PATH } from "#src/services/constants";

interface Props {
  // The share of the tapered ends' size they are drawn at, their full size when none is given
  endScale?: number;
  // The colour the ends and the middle are drawn in, the silver when none is given
  fill?: string;
  // A rule whose hairline the caller draws itself, at its own opacity, with the ends laid over it
  isHairlineHidden?: true;
  // A rule the game draws with its ends but no diamond at its middle, as the weapon screen's header and footer rules are
  isMiddleHidden?: true;
  // The share of the silver the piece is drawn at.
  // The game's hairline is opaque on a light screen and translucent over a dark scene.
  // A screen over a scene therefore passes the share its hairline reads at.
  opacity?: number;
}

const { opacity = 1 } = defineProps<Props>();
</script>

<template>
  <!-- The game's divider: a hairline as wide as its parent, a tapered diamond at each end and an interlocked double
       Diamond at its middle, in the game's units from the parent's `--unit` -->
  <div
    class="ornament-divider"
    :class="{ 'hairline-hidden': isHairlineHidden }"
    aria-hidden="true"
    :style="{ '--end-scale': endScale, fill, opacity }"
  >
    <svg class="end" viewBox="0 0 320 224"><path :d="ORNAMENT_END_PATH" /></svg>
    <svg v-if="!isMiddleHidden" class="middle" viewBox="0 0 480 320"><path :d="ORNAMENT_MIDDLE_PATH" /></svg>
    <svg class="end right" viewBox="0 0 320 224"><path :d="ORNAMENT_END_PATH" /></svg>
  </div>
</template>

<style scoped>
.ornament-divider {
  position: relative;
  height: calc(var(--unit) * 30);
  fill: #d7d7d7;
}

.ornament-divider::before {
  position: absolute;
  top: 50%;
  right: calc(var(--unit) * 4);
  left: calc(var(--unit) * 4);
  height: calc(var(--unit) * 3);
  background: #d7d7d7;
  content: "";
  translate: 0 -50%;
}

.ornament-divider.hairline-hidden::before {
  display: none;
}

.end {
  position: absolute;
  top: 50%;
  left: 0;
  width: calc(var(--unit) * 30 * var(--end-scale, 1));
  height: calc(var(--unit) * 21 * var(--end-scale, 1));
  translate: 0 -50%;
}

.right {
  right: 0;
  left: auto;
  scale: -1 1;
}

.middle {
  position: absolute;
  top: 0;
  left: 50%;
  width: calc(var(--unit) * 45);
  height: calc(var(--unit) * 30);
  translate: -50% 0;
}
</style>
