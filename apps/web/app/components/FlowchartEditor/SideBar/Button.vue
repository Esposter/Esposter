<script setup lang="ts">
import { useFlowchartEditorStore } from "@/store/flowchartEditor";

const flowchartEditorStore = useFlowchartEditorStore();
const { isSidebarOpen } = storeToRefs(flowchartEditorStore);
</script>

<template>
  <div v-if="!isSidebarOpen" class="vue-flow__panel">
    <StyledTooltipIconButton icon="i-mdi:chevron-double-right" text="Components" @click="isSidebarOpen = true" />
  </div>
</template>
