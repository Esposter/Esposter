<script setup lang="ts">
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { goToOccurrence } = findReplaceStore;
const { occurrences } = storeToRefs(findReplaceStore);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ disabled: occurrences.length === 0, size: 'small', variant: 'text' }"
    icon="mdi-chevron-down"
    text="Next (Enter)"
    @click="goToOccurrence(1)"
  />
</template>
