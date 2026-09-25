<script setup lang="ts">
import { Progress } from "@vuetify/v0";

interface Props {
  label: string;
  // How much is done, out of a hundred
  value: number;
}
// A page's progress as one thin line along an edge, over the page rather than in its flow, so where it hangs is the
// Caller's. What the fill is drawn with and the length it grows by are the style's: standard's one eased fill, voxel's a
// Row of pixel blocks that grows a whole block at a time
const { label, value } = defineProps<Props>();
</script>

<template>
  <Progress.Root :aria-label="label" :model-value="value" h-1>
    <Progress.Fill renderless />
    <span class="fill" :style="{ width: `round(down, ${value}%, var(--ui-line-snap))` }" h-full block />
  </Progress.Root>
</template>

<style scoped>
.fill {
  background: var(--ui-line-fill);
  transition: width var(--ui-motion-medium);
}
</style>
