<script setup lang="ts">
import { useFlowchartExportStore } from "@/store/flowchartEditor/export";

const flowchartExportStore = useFlowchartExportStore();
const { exportRequest } = storeToRefs(flowchartExportStore);
</script>

<template>
  <ResourceFlowchartExportCanvas v-if="exportRequest" :request="exportRequest" />
</template>
