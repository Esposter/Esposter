<script setup lang="ts">
interface Props {
  // Folded into the one diamond at its middle, as the game draws a bar that is done or not yet opened
  isFolded?: boolean;
  // How much is done, from 0 to 1
  progress: number;
}

const { isFolded, progress } = defineProps<Props>();
</script>

<template>
  <!-- The game's progress bar, 394 units from diamond to diamond: a dark track 10 units high with pointed ends between
       Two small white diamonds, filled white from its left, measured from the English client's login screen. It opens
       Out of its middle over 250 ms as it mounts and folds back into it, so its diamonds meet as one: the English
       Recording's login screen at 60 frames -->
  <div
    :class="['progress-bar', { folded: isFolded }]"
    role="progressbar"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(progress * 100)"
  >
    <span class="diamond" />
    <span class="track"><span class="fill" :style="{ width: `${progress * 100}%` }" /></span>
    <span class="diamond" />
  </div>
</template>

<style scoped>
.progress-bar {
  --open-ms: 250ms;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(var(--unit) * 394);
  animation: open var(--open-ms) ease-out;
  transition: width var(--open-ms) ease-in;
}

.folded {
  width: calc(var(--unit) * 6.5);
}

@keyframes open {
  from {
    width: calc(var(--unit) * 6.5);
  }
}

.diamond {
  flex: none;
  width: calc(var(--unit) * 6.5);
  height: calc(var(--unit) * 6.5);
  background: #fff;
  rotate: 45deg;
}

/* The track is what lies between the diamonds, less a 3 unit gap either side, so a folded bar has none */
.track {
  flex: 1;
  min-width: 0;
  height: calc(var(--unit) * 10);
  margin: 0 calc(var(--unit) * 3);
  background: rgb(38 38 38 / 0.85);
  clip-path: polygon(
    calc(var(--unit) * 6) 0,
    calc(100% - var(--unit) * 6) 0,
    100% 50%,
    calc(100% - var(--unit) * 6) 100%,
    calc(var(--unit) * 6) 100%,
    0 50%
  );
}

.folded .track {
  margin: 0;
}

.folded .diamond + .track + .diamond {
  display: none;
}

.fill {
  display: block;
  height: 100%;
  background: #fff;
}
</style>
