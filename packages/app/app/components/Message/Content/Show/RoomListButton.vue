<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { isLeftDrawerOpen, isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <StyledTooltipIconButton
    v-if="!isLeftDrawerOpenAuto"
    :button-props="{ size: 'small' }"
    icon="mdi-menu"
    text="Show Room List"
    :tooltip-props="{ location: 'bottom' }"
    @click="isLeftDrawerOpen = true"
  />
</template>
