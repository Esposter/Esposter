<script setup lang="ts">
import { LOADING_BAR_BLOCK_COUNT } from "#src/services/ui/constants";
import { Progress } from "@vuetify/v0";

interface Props {
  label: string;
  // How much is done, out of a hundred
  value: number;
}

defineProps<Props>();
const uiStyle = useUiStyle();
</script>

<!-- A game's loading bar: a row of the style's blocks, filled from the start as the work gets done -->
<template>
  <Progress.Root
    :aria-label="label"
    :model-value="value"
    :data-ui-style="uiStyle"
    :style="{ '--ui-blocks-value': `${value}%` }"
    ui-blocks
  >
    <Progress.Fill renderless />
    <UiFilledBlocks :block-count="LOADING_BAR_BLOCK_COUNT" :value />
  </Progress.Root>
</template>
