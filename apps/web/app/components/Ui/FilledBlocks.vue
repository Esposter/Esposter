<script setup lang="ts">
interface Props {
  // How many blocks the row has
  blockCount: number;
  // How much is done, out of a hundred
  value: number;
}

const { blockCount, value } = defineProps<Props>();
// A block fills once the reading reaches its share of the row, so the row fills a block at a time as the reading climbs
const filledBlockCount = computed(() => Math.round((value / 100) * blockCount));
</script>

<!-- The blocks a row of ui-blocks draws, its root and its colours left to the element that holds them -->
<template>
  <span v-for="index of blockCount" :key="index" :data-filled="index <= filledBlockCount || undefined" ui-block />
</template>
