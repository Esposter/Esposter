<script setup lang="ts">
import { VOXEL_DIGIT_WIDTH, VOXEL_DROP_STAGGER_MS } from "@/services/app/constants";
import { VoxelDigitMap } from "@/services/app/VoxelDigitMap";

interface Props {
  description: string;
  // A block knocked out of the middle digit and lying on the floor beneath it: the page that is not there
  isMissingBlock?: true;
  statusCode: number;
  title: string;
}

defineSlots<{ default: () => VNode }>();
const { description, isMissingBlock, statusCode, title } = defineProps<Props>();
// Every digit's voxels, each block dropping in a beat after the one to its left so the number builds from the floor up
const digits = computed(() => {
  const characters = [...String(statusCode)];
  const middleIndex = Math.floor(characters.length / 2);
  return characters.map((character, digitIndex) => {
    const cells = [...(VoxelDigitMap[character] ?? []).join("")];
    const missingCellIndex = isMissingBlock && digitIndex === middleIndex ? cells.lastIndexOf("1") : -1;
    return cells.map((cell, cellIndex) => ({
      delay: `${(digitIndex * VOXEL_DIGIT_WIDTH + (cellIndex % VOXEL_DIGIT_WIDTH)) * VOXEL_DROP_STAGGER_MS}ms`,
      isLit: cell === "1" && cellIndex !== missingCellIndex,
    }));
  });
});
const fallenBlockDelay = computed(() => `${digits.value.length * VOXEL_DIGIT_WIDTH * VOXEL_DROP_STAGGER_MS}ms`);
</script>

<template>
  <section p-6 text-center flex flex-col gap-8 items-center font="[var(--ui-font-heading)]">
    <div role="img" :aria-label="`Status ${statusCode}`" pb-8 flex gap-4 relative md:gap-6>
      <div v-for="(cells, digitIndex) of digits" :key="digitIndex" gap-1 grid cols-3>
        <span
          v-for="({ delay, isLit }, cellIndex) of cells"
          :key="cellIndex"
          :class="{ 'block ui-raised': isLit }"
          :style="{ animationDelay: delay }"
          size-6
          md:size-8
        />
      </div>
      <span
        v-if="isMissingBlock"
        class="fallen block"
        :style="{ animationDelay: fallenBlockDelay }"
        size-6
        bottom-0
        left="1/2"
        absolute
        ui-raised
        md:size-8
      />
    </div>
    <h1 text-5xl text-accent>{{ title }}</h1>
    <p text-xl text-muted max-w-prose>{{ description }}</p>
    <div flex flex-wrap gap-3 justify-center>
      <slot />
    </div>
  </section>
</template>

<style scoped>
/* A block drops from above, the way a voxel falls in a game, and lands where it stands */
.block {
  animation: drop var(--ui-motion-long) both;
}

.fallen {
  animation-name: tumble;
  transform: translateX(-50%) rotate(20deg);
}

@keyframes drop {
  from {
    opacity: 0;
    transform: translateY(-300%);
  }
}

@keyframes tumble {
  from {
    opacity: 0;
    transform: translate(-50%, -600%) rotate(0deg);
  }
}

/* The timing already takes no time under reduced motion, but each block's stagger would still hold it back */
@media (prefers-reduced-motion: reduce) {
  .block {
    animation: none;
  }
}
</style>
