<script setup lang="ts">
interface Props {
  // What is being waited on, for a screen reader, since the mark shows no word
  label: string;
}

const { label } = defineProps<Props>();
</script>

<template>
  <!-- The game's wait mark: a dark glass square 120 units across with rounded corners, and in it a white ring 40 units
       Across that fades out from its round head round to its tail, turning. Measured from a 1440 high recording -->
  <div class="loading-spinner" role="status" :aria-label="label"><span class="ring" /></div>
</template>

<style scoped>
.loading-spinner {
  display: grid;
  width: calc(var(--unit) * 120);
  height: calc(var(--unit) * 120);
  border-radius: calc(var(--unit) * 15);
  background: rgb(8 14 36 / 0.72);
  place-items: center;
}

/* The ring is a conic gradient cut to an annulus, its head a dot at the gradient's bright end */
.ring {
  position: relative;
  width: calc(var(--unit) * 48);
  height: calc(var(--unit) * 48);
  border-radius: 50%;
  animation: turn 1s linear infinite;
  background: conic-gradient(from 200deg, transparent, rgb(255 255 255 / 0.45) 55%, #fff 88%, transparent 88%);
  mask: radial-gradient(circle, transparent calc(var(--unit) * 16.5), #000 calc(var(--unit) * 17));
}

.ring::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(var(--unit) * 7);
  height: calc(var(--unit) * 7);
  border-radius: 50%;
  background: #fff;
  content: "";
  /* The head sits where the gradient's bright end does, 88% of the turn on from 200 degrees */
  transform: rotate(516.8deg) translateY(calc(var(--unit) * -20.5)) translate(-50%, -50%);
  transform-origin: 0 0;
}

@keyframes turn {
  to {
    rotate: 1turn;
  }
}
</style>
