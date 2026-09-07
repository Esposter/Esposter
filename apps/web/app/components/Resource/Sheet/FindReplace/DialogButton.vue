<script setup lang="ts">
import { DENSE_ICON_BUTTON_PROPS } from "@/services/shared/constants";
import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { isFindReplaceOpen } = storeToRefs(findReplaceStore);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="DENSE_ICON_BUTTON_PROPS"
    icon="mdi-magnify"
    text="Find & Replace"
    @click.stop="isFindReplaceOpen = !isFindReplaceOpen"
  />
</template>
