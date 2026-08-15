<script setup lang="ts">
import type { VBtn } from "vuetify/components";

import { useFindReplaceStore } from "@/store/resource/sheet/findReplace";

const findReplaceStore = useFindReplaceStore();
const { goToOccurrence } = findReplaceStore;
const { occurrences } = storeToRefs(findReplaceStore);
const buttonProps = computed<VBtn["$props"]>(() => ({
  disabled: occurrences.value.length === 0,
  size: "small",
  variant: "text",
}));
</script>

<template>
  <StyledTooltipIconButton
    :button-props
    icon="mdi-chevron-up"
    text="Previous (Shift+Enter)"
    @click="goToOccurrence(-1)"
  />
</template>
