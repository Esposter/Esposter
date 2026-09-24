<script setup lang="ts">
import type { Card } from "@/models/visual/Card";

interface Props {
  cards: Card[];
}

const { cards } = defineProps<Props>();
</script>

<template>
  <div
    :style="{
      '--duration': '10s',
      '--transition': '.15s',
      '--active': 0,
    }"
    class="window"
    p-4
    ui-frame
  >
    <div class="scene" h-64>
      <div class="grid" px-4 list-none gap-x-4 grid h-full>
        <div v-for="(card, index) of cards" :key="index" class="item-container">
          <div class="item" p-4 text-center flex h-full cursor-pointer items-center justify-center ui-frame ui-heading>
            {{ card.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "sass:math";
// Update manually when the card count changes: Sass loops run at compile-time and can't index on run-time Vue props.
$card-length: 6;

.window {
  container-type: inline-size;
  transform-style: preserve-3d;
}

.scene {
  --buff: 3rem;
  mask:
    linear-gradient(transparent, black var(--buff) calc(100% - var(--buff)), transparent),
    linear-gradient(90deg, transparent, black var(--buff) calc(100% - var(--buff)), transparent);
  mask-composite: intersect;
}

.grid {
  --rows: #{math.ceil(calc($card-length / 2))};
  --inset: 0;
  --outset: 1;
  grid-template-columns: 1fr 1fr;
  transition: transform var(--transition-move-duration);
  transform: rotateX(20deg) rotateZ(-20deg) skewX(20deg);
  transform-style: preserve-3d;

  &:hover .item-container {
    animation-play-state: paused;
  }
}

.item-container {
  --delay: calc(calc(var(--duration) / var(--rows)) * (var(--index, 0) - 8));
  translate: 0% calc(((var(--rows) - var(--index)) + var(--inset, 0)) * 100%);
  animation: slide var(--duration) var(--delay) infinite linear;
  transform-style: preserve-3d;

  &:hover {
    --active: 1;
  }
}

@keyframes slide {
  100% {
    translate: 0% calc(calc((var(--index) + var(--outset, 0)) * -100%));
  }
}

@for $i from 1 through $card-length {
  .item-container:nth-of-type(#{$i}) {
    --index: #{math.floor(calc(($i - 1) / 2))};
  }
}

.item {
  transition:
    transform var(--transition),
    scale var(--transition);
  scale: calc(1 + (var(--active) * 0.05));
  transform: translate3d(0, 0, calc(var(--active) * 1.5rem));
}

@container (width < 25rem) {
  .grid {
    --rows: #{$card-length};
    grid-template-columns: 1fr;
  }

  @for $i from 1 through $card-length {
    .item-container:nth-of-type(#{$i}) {
      --index: #{$i - 1};
    }
  }
}
</style>
