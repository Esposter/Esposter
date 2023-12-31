<script setup lang="ts">
import { type Card } from "@/models/visual/Card";

interface VisualCardMarqueeProps {
  cards: Card[];
}

const { cards } = defineProps<VisualCardMarqueeProps>();
const { surface } = useColors();
</script>

<template>
  <StyledCard
    :style="{
      '--one-card-col-rows': Math.ceil(cards.length / 2),
      '--speed': '10s',
      '--transition': '.15s',
      '--active': 0,
    }"
    class="window"
    p-4="!"
    h-64
  >
    <div class="scene" w-full h-full>
      <ul class="grid" px-4 w-full h-full>
        <li v-for="(card, index) in cards" :key="index">
          <div class="item">
            <div class="item-text" min-h-16>
              {{ card.text }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </StyledCard>
</template>

<style scoped lang="scss">
$card-length: 10;

.window {
  container-type: inline-size;
  transform-style: preserve-3d;
}

.scene {
  --buff: 3rem;
  mask: linear-gradient(transparent, white var(--buff) calc(100% - var(--buff)), transparent),
    linear-gradient(90deg, transparent, white var(--buff) calc(100% - var(--buff)), transparent);
  mask-composite: intersect;
}

.grid {
  --cols: 1;
  --rows: var(--one-card-col-rows) * var(--cols);
  // Controls the grid animation offset on entry/exit
  --inset: 0;
  --outset: 2.5;
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
  min-height: 60px;
  transform-style: preserve-3d;
  z-index: calc(1 + var(--active));

  &::before {
    content: "";
    position: absolute;
    inset: 4px 4px -2px -2px;
    border-radius: 6px;
    background: hsl(0 0% 0% / 0.1);
    scale: 1 calc(1 + (var(--active, 0) * 0.05));
    filter: blur(calc(var(--active, 0) * 8px));
    z-index: -1;
    transition:
      scale var(--transition),
      opacity var(--transition),
      translate var(--transition),
      filter var(--transition);
    transform-origin: 50% 0;
    box-shadow:
      0 0 #0000,
      0 0 #0000,
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
}

.item {
  align-items: center;
  background: hsl(0 0% 100%);
  border: 1px solid hsl(0 0% 90%);
  color: hsl(0 0% 10%);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  height: 100%;
  justify-content: start;
  overflow: hidden;
  padding: 1.25rem;
  text-align: center;
  width: 100%;
  transition:
    transform var(--transition),
    scale var(--transition),
    background-color 0.25s,
    color 0.25s,
    border 0.25s,
    box-shadow 0.25s;
  scale: calc(1 + (var(--active, 0) * 0.05));
  transform: translate3d(0, 0, calc(var(--active, 0) * 24px));
}

@for $i from 1 through $card-length {
  li:nth-of-type(#{$i}) {
    --index: (#{$i} - 1) / 2;
  }
}

li {
  --duration: calc(var(--speed) * 1);
  --delay: calc((var(--duration) / var(--rows)) * (var(--index, 0) - 8));
  translate: 0% calc(((var(--rows) - var(--index)) + var(--inset, 0)) * 100%);
  animation: slide var(--duration) var(--delay) infinite linear;

  &:hover {
    --active: 1;
  }
}

@keyframes slide {
  100% {
    translate: 0% calc(calc((var(--index) + var(--outset, 0)) * -100%));
  }
}

@container (width < 400px) {
  .grid {
    --cols: 2;
    --inset: 0;
    --outset: 3;
    grid-template-columns: 1fr;
  }

  @for $i from 1 through $card-length {
    li:nth-of-type(#{$i}) {
      --index: #{$i} - 1;
    }
  }

  li {
    --duration: calc(var(--speed) * 2);
    --delay: calc((var(--duration) / var(--rows)) * (var(--index, 0) - 8));
  }
}
</style>
