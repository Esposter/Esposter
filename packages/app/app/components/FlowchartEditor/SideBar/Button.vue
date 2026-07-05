<script setup lang="ts">
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { isLeftDrawerOpen, isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
</script>

<template>
  <div v-if="!isLeftDrawerOpenAuto" class="vue-flow__panel">
    <StyledTooltipIconButton icon="mdi-chevron-double-right" text="Components" @click="isLeftDrawerOpen = true" />
  </div>
</template>
