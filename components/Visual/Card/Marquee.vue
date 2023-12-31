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
    :style="{ '--card-length': cards.length, '--speed': '10s', '--transition': '.15s', '--active': 0 }"
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
$card-length: 3;

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
  --count: var(--card-length);
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
  gap: 1rem;
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

li:nth-of-type(1) {
  --index: 0;
}
li:nth-of-type(2) {
  --index: 0;
}
li:nth-of-type(3) {
  --index: 1;
}
li:nth-of-type(4) {
  --index: 1;
}
li:nth-of-type(5) {
  --index: 2;
}
li:nth-of-type(6) {
  --index: 2;
}
li:nth-of-type(7) {
  --index: 3;
}
li:nth-of-type(8) {
  --index: 3;
}
li:nth-of-type(9) {
  --index: 4;
}
li:nth-of-type(10) {
  --index: 4;
}
li:nth-of-type(11) {
  --index: 5;
}
li:nth-of-type(12) {
  --index: 5;
}

@container (width < 400px) {
  .grid {
    --count: 12;
    --inset: 0;
    --outset: 3;
    grid-template-columns: 1fr;
  }

  li:nth-of-type(1) {
    --index: 0;
  }
  li:nth-of-type(2) {
    --index: 1;
  }
  li:nth-of-type(3) {
    --index: 2;
  }
  li:nth-of-type(4) {
    --index: 3;
  }
  li:nth-of-type(5) {
    --index: 4;
  }
  li:nth-of-type(6) {
    --index: 5;
  }
  li:nth-of-type(7) {
    --index: 6;
  }
  li:nth-of-type(8) {
    --index: 7;
  }
  li:nth-of-type(9) {
    --index: 8;
  }
  li:nth-of-type(10) {
    --index: 9;
  }
  li:nth-of-type(11) {
    --index: 10;
  }
  li:nth-of-type(12) {
    --index: 11;
  }

  li {
    --duration: calc(var(--speed) * 2);
    --delay: calc((var(--duration) / var(--count)) * (var(--index, 0) - 8));
  }
}

.grid {
  gap: 0 2rem;
}

li {
  --duration: calc(var(--speed) * 1);
  --delay: calc((var(--duration) / var(--count)) * (var(--index, 0) - 8));
  animation: slide var(--duration) var(--delay) infinite linear;
  translate: 0% calc(((var(--count) - var(--index)) + var(--inset, 0)) * 100%);
}
li:hover {
  --active: 1;
}
@keyframes slide {
  100% {
    translate: 0% calc(calc((var(--index) + var(--outset, 0)) * -100%));
  }
}
@container (width < 400px) {
  li {
    --duration: calc(var(--speed) * 2);
    --delay: calc((var(--duration) / var(--count)) * (var(--index, 0) - 8));
  }
}
</style>
