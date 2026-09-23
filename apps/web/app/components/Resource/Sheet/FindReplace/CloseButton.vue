<script setup lang="ts">
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { isFindReplaceOpen } = storeToRefs(findReplaceStore);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ density: 'compact', variant: 'text' }"
    icon="i-mdi:close"
    text="Close"
    @click="isFindReplaceOpen = false"
  />
</template>
