<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";

const flowchartEditorStore = useFlowchartEditorStore();
const { isSidebarOpen } = storeToRefs(flowchartEditorStore);
</script>

<template>
  <div v-if="!isSidebarOpen" class="vue-flow__panel">
    <UiIconButton label="Components" :meaning="UiIconMeaning.Next" @click="isSidebarOpen = true" />
  </div>
</template>
