<script setup lang="ts">
import { type Card } from "@/models/visual/Card";

interface VisualCardMarqueeProps {
  cards: Card[];
}

const { cards } = defineProps<VisualCardMarqueeProps>();
</script>

<template>
  <v-card class="window">
    <div class="scene">
      <div class="grid">
        <div v-for="(card, index) in cards" :key="index" class="item">
          <div class="item-text" text-center>{{ card.text }}</div>
        </div>
      </div>
    </div>
  </v-card>
</template>

<style scoped lang="scss">
$card-length: 12;

:root {
  --speed: 10s;
  --transition: 0.15s;
  --active: 0;
}

.window {
  container-type: inline-size;
  height: 250px;
  transform-style: preserve-3d;
  transition: outline 0.5s;
  outline: 0.25rem dashed transparent;
}

.scene {
  --buff: 3rem;
  width: 100%;
  height: 100%;
  mask: linear-gradient(transparent, white var(--buff) calc(100% - var(--buff)), transparent),
    linear-gradient(90deg, transparent, white var(--buff) calc(100% - var(--buff)), transparent);
  mask-composite: intersect;
}

.grid {
  --count: 6;
  // Controls the grid animation offset on entry/exit
  --inset: 0;
  --outset: 2.5;
  width: 100%;
  height: 100%;
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 2rem;
  transform-style: preserve-3d;
  transition: transform 0.5s;
  transform: rotateX(20deg) rotateZ(-20deg) skewX(20deg);

  :hover .item-text {
    animation-play-state: paused;
  }
}

.item-text {
  width: 100%;
  min-height: 60px;
  transform-style: preserve-3d;
  z-index: calc(1 + var(--active));

  ::before {
    content: "";
    position: absolute;
    inset: 4px 4px -2px -2px;
    scale: 1 calc(1 + (var(--active) * 0.05));
    filter: blur(calc(var(--active) * 8px));
    transition:
      scale var(--transition),
      opacity var(--transition),
      translate var(--transition),
      filter var(--transition);
    transform-origin: 50% 0;
  }
}

.item {
  transition:
    transform var(--transition),
    scale var(--transition),
    background-color 0.25s,
    color 0.25s,
    border 0.25s,
    box-shadow 0.25s;
  scale: calc(1 + (var(--active) * 0.05));
  transform: translate3d(0, 0, calc(var(--active) * 24px));
}

@for $i from 1 through $card-length {
  .item-text:nth-of-type(#{$i}) {
    --index: (#{$i} - 1)/ 2;
  }
}

.item-text {
  --duration: calc($speed * 1);
  --delay: calc((var(--duration) / var(--count)) * (var(--index) - 8));
  animation: slide var(--duration) var(--delay) infinite linear;
  translate: 0% calc(((var(--count) - var(--index)) + var(--inset)) * 100%);

  :hover {
    --active: 1;
  }
}

@keyframes slide {
  100% {
    translate: 0% calc(calc((var(--index) + var(--outset)) * -100%));
  }
}

@container (width < 400px) {
  .grid {
    --count: 12;
    --inset: 0;
    --outset: 3;
    grid-template-columns: 1fr;
  }

  @for $i from 1 through $card-length {
    .item-text:nth-of-type(#{$i}) {
      --index: #{$i} - 1;
    }
  }

  .item-text {
    --duration: calc($speed * 2);
    --delay: calc((var(--duration) / var(--count)) * (var(--index) - 8));
  }
}
</style>
