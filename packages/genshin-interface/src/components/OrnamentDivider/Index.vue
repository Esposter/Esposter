<script setup lang="ts">
import { ORNAMENT_END_PATH, ORNAMENT_MIDDLE_PATH } from "#src/services/OrnamentPath";
</script>

<template>
  <!-- The game's divider: a hairline as wide as its parent, a tapered diamond at each end and an interlocked double
       Diamond at its middle, in the game's units from the parent's `--unit` -->
  <div class="ornament-divider" aria-hidden="true">
    <svg class="end" viewBox="0 0 320 224"><path :d="ORNAMENT_END_PATH" /></svg>
    <svg class="middle" viewBox="0 0 480 320"><path :d="ORNAMENT_MIDDLE_PATH" /></svg>
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

.end {
  position: absolute;
  top: 50%;
  left: 0;
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 21);
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
