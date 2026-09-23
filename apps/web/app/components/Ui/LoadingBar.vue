<script setup lang="ts">
import { LOADING_BAR_BLOCK_COUNT } from "@/services/ui/constants";
import { Progress } from "@vuetify/v0";

interface Props {
  label: string;
  // How much is done, out of a hundred
  value: number;
}

const { label, value } = defineProps<Props>();
const filledBlockCount = computed(() => Math.round((value / 100) * LOADING_BAR_BLOCK_COUNT));
</script>

<template>
  <Progress.Root :aria-label="label" :model-value="value" flex gap-1>
    <Progress.Fill renderless />
    <span
      v-for="index of LOADING_BAR_BLOCK_COUNT"
      :key="index"
      class="block"
      :data-filled="index <= filledBlockCount || undefined"
    />
  </Progress.Root>
</template>

<style scoped>
/* A game's loading bar: a row of voxel blocks, filled from the start as the work gets done */
.block {
  background-color: var(--ui-panel);
  box-shadow: inset 0 calc(var(--ui-step) / -2) 0 0 var(--ui-panel-edge);
  height: calc(var(--ui-step) * 6);
  width: calc(var(--ui-step) * 4);
}

.block[data-filled] {
  background-color: var(--ui-accent);
}
</style>
