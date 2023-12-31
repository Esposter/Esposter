<script setup lang="ts">
import { type Card } from "@/models/visual/Card";

interface VisualCardMarqueeProps {
  cards: Card[];
}

const { cards } = defineProps<VisualCardMarqueeProps>();
const { surface, "on-surface": onSurface } = useColors();
</script>

<template>
  <StyledCard
    :style="{
      '--duration': '10s',
      '--transition': '.15s',
      '--active': 0,
    }"
    class="window"
    p-4="!"
  >
    <div class="scene" h-64>
      <ul class="grid" px-4 h-full>
        <li v-for="(card, index) in cards" :key="index">
          <div
            class="item border-sm"
            p-4
            h-full
            flex
            justify-center
            items-center
            text-center
            rd-1
            cursor-pointer
            font-Montserrat
          >
            {{ card.text }}
          </div>
        </li>
      </ul>
    </div>
  </StyledCard>
</template>

<style scoped lang="scss">
// @NOTE: Make sure to manually change this when the total number of cards are changed
// Unforunately we have to do this manually because we cannot use vue props as an index
// for sass loops :C
$card-length: 3;

.window {
  container-type: inline-size;
  transform-style: preserve-3d;
}

.scene {
  --buff: 3rem;
  mask: linear-gradient(transparent, v-bind(surface) var(--buff) calc(100% - var(--buff)), transparent),
    linear-gradient(90deg, transparent, v-bind(surface) var(--buff) calc(100% - var(--buff)), transparent);
  mask-composite: intersect;
}

.grid {
  --rows: #{ceil($card-length / 2)};
  --inset: var(--rows);
  --outset: var(--rows);
  list-style-type: none;
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  transition: transform 0.5s;
  transform: rotateX(20deg) rotateZ(-20deg) skewX(20deg);
  transform-style: preserve-3d;

  &:hover li {
    animation-play-state: paused;
  }
}

li {
  // We want the total distance travelled to be the size of 4 containers (or var(--rows))
  // Starting at 2 from the beginning and finishing at 2 to the end
  --distance: calc(var(--rows) * 4);
  --delay: calc(var(--duration) * var(--index) / var(--distance));
  translate: 0% calc((var(--rows) - var(--index) + var(--inset)) * 100%);
  animation: slide var(--duration) var(--delay) infinite linear;
  transform-style: preserve-3d;

  &:hover {
    --active: 1;
  }

  &::before {
    content: "";
    position: absolute;
    inset: 4px 4px -2px -2px;
    border-radius: 0.25rem;
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
      0 4px 6px -1px rgba(black, 0.1),
      0 2px 4px -2px rgba(black, 0.1);
  }
}

@keyframes slide {
  100% {
    translate: 0% calc((var(--rows) + var(--index) + var(--outset)) * -100%);
  }
}

@for $i from 1 through $card-length {
  li:nth-of-type(#{$i}) {
    --index: #{floor(($i - 1) / 2)};
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
  transform: translate3d(0, 0, calc(var(--active) * 24px));
}

@container (width < 400px) {
  .grid {
    --rows: #{$card-length};
    grid-template-columns: 1fr;
  }

  @for $i from 1 through $card-length {
    li:nth-of-type(#{$i}) {
      --index: #{$i - 1};
    }
  }
}
</style>
