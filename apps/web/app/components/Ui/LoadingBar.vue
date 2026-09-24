<script setup lang="ts">
import { LOADING_BAR_BLOCK_COUNT } from "@/services/ui/constants";
import { Progress } from "@vuetify/v0";

interface Props {
  label: string;
  // How much is done, out of a hundred
  value: number;
}

const { label, value } = defineProps<Props>();
const uiStyle = useUiStyle();
const filledBlockCount = computed(() => Math.round((value / 100) * LOADING_BAR_BLOCK_COUNT));
</script>

<!-- A game's loading bar: a row of voxel blocks, filled from the start as the work gets done -->
<template>
  <Progress.Root :aria-label="label" :model-value="value" :data-ui-style="uiStyle" ui-blocks>
    <Progress.Fill renderless />
    <span
      v-for="index of LOADING_BAR_BLOCK_COUNT"
      :key="index"
      :data-filled="index <= filledBlockCount || undefined"
      ui-block
    />
  </Progress.Root>
</template>
