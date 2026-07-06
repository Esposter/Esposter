<script setup lang="ts">
import { useFindReplaceStore } from "@/store/tableEditor/file/findReplace";

const findReplaceStore = useFindReplaceStore();
const { isFindReplaceOpen } = storeToRefs(findReplaceStore);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    icon="mdi-magnify"
    text="Find & Replace"
    @click.stop="isFindReplaceOpen = !isFindReplaceOpen"
  />
</template>
