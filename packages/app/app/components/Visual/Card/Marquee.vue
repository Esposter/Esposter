<script setup lang="ts">
import type { Card } from "@/models/visual/Card";

import { useColorsStore } from "@/store/colors";

interface Props {
  cards: Card[];
}

const { cards } = defineProps<Props>();
const colorsStore = useColorsStore();
const { "on-surface": onSurface, surface } = storeToRefs(colorsStore);
</script>

<template>
  <StyledCard
    :style="{
      '--duration': '10s',
      '--transition': '.15s',
      '--active': 0,
    }"
    class="window"
    p-4
  >
    <div class="scene" h-64>
      <div class="grid" px-4 list-none gap-x-4 grid h-full>
        <div v-for="(card, index) of cards" :key="index" class="item-container">
          <div
            class="item"
            font="[Montserrat]"
            p-4
            text-center
            b-1
            rd
            flex
            h-full
            cursor-pointer
            font-italic
            items-center
            justify-center
          >
            {{ card.text }}
          </div>
        </div>
      </div>
    </div>
  </StyledCard>
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
    linear-gradient(transparent, v-bind(surface) var(--buff) calc(100% - var(--buff)), transparent),
    linear-gradient(90deg, transparent, v-bind(surface) var(--buff) calc(100% - var(--buff)), transparent);
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

  &::before {
    content: "";
    position: absolute;
    inset: 0.25rem 0.25rem -0.125rem -0.125rem;
    border-radius: var(--border-radius);
    background-color: v-bind(onSurface);
    opacity: 0.1;
    scale: 1 calc(1 + (var(--active) * 0.05));
    filter: blur(calc(var(--active) * 0.5rem));
    transition:
      scale var(--transition),
      opacity var(--transition),
      translate var(--transition),
      filter var(--transition);
    transform-origin: 50% 0;
    box-shadow:
      0 0 black,
      0 0 black,
      0 0.25rem 0.375rem -0.0625rem rgba(black, 0.1),
      0 0.125rem 0.25rem -0.125rem rgba(black, 0.1);
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
  background-color: v-bind(surface);
  transition:
    transform var(--transition),
    scale var(--transition),
    background-color 0.25s,
    color 0.25s,
    border 0.25s,
    box-shadow 0.25s;
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
