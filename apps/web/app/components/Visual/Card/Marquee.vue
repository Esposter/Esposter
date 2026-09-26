<script setup lang="ts">
import type { Card } from "@/models/visual/Card";

interface Props {
  cards: Card[];
}

const { cards } = defineProps<Props>();
</script>

<template>
  <div :style="{ '--duration': '10s', '--transition': '.15s', '--active': 0 }" class="window">
    <div class="scene" h-64>
      <!-- The row counts and each card's row come from the cards themselves, one layout for two columns and one for a
        Single column, so the stylesheet never counts the cards it lays out -->
      <div
        :style="{ '--column-rows': Math.ceil(cards.length / 2), '--single-column-rows': cards.length }"
        class="grid"
        px-4
        list-none
        gap-x-4
        grid
        h-full
      >
        <div
          v-for="(card, index) of cards"
          :key="index"
          :style="{ '--column-index': Math.floor(index / 2), '--single-column-index': index }"
          class="item-container"
        >
          <div class="item" p-4 text-center flex h-full items-center justify-center ui-frame ui-heading>
            {{ card.text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
  --rows: var(--column-rows);
  --inset: 0;
  --outset: 1;
  grid-template-columns: 1fr 1fr;
  transition: transform var(--ui-motion-long);
  transform: rotateX(20deg) rotateZ(-20deg) skewX(20deg);
  transform-style: preserve-3d;

  &:hover .item-container {
    animation-play-state: paused;
  }
}

.item-container {
  --index: var(--column-index);
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

.item {
  transition:
    transform var(--transition),
    scale var(--transition);
  scale: calc(1 + (var(--active) * 0.05));
  transform: translate3d(0, 0, calc(var(--active) * 1.5rem));
}

@container (width < 25rem) {
  .grid {
    --rows: var(--single-column-rows);
    grid-template-columns: 1fr;
  }

  .item-container {
    --index: var(--single-column-index);
  }
}
</style>
