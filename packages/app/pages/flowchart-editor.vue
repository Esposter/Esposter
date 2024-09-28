<script setup lang="ts">
import { dayjs } from "@/services/dayjs";
import { DEFAULT_NODE_TYPE } from "@/services/flowchartEditor/constants";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { useVueFlow, VueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";

defineRouteRules({ ssr: false });

await useReadFlowchartEditor();
const flowchartEditorStore = useFlowchartEditorStore();
const { saveFlowchartEditor } = flowchartEditorStore;
const debouncedSaveFlowChartEditor = useDebounceFn(
  () => saveFlowchartEditor(),
  dayjs.duration(1, "second").asMilliseconds(),
);
const { flowchartEditor } = storeToRefs(flowchartEditorStore);
const { onEdgesChange, onNodesChange } = useVueFlow();
const { onDragLeave, onDragOver, onDrop } = useDragAndDrop();

onEdgesChange(async () => {
  await debouncedSaveFlowChartEditor();
});

onNodesChange(async () => {
  await debouncedSaveFlowChartEditor();
});
</script>

<template>
  <NuxtLayout>
    <template #left>
      <FlowchartEditorSideBar />
    </template>
    <div class="bg-surface" h-full @drop="onDrop">
      <VueFlow
        v-model:nodes="flowchartEditor.nodes"
        v-model:edges="flowchartEditor.edges"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
      >
        <Background />
        <Controls position="top-right" />
        <MiniMap />
        <FlowchartEditorDropzoneBackground />
        <template #[`node-${DEFAULT_NODE_TYPE}`]="{ data }">
          <FlowchartEditorBaseNode :data />
        </template>
      </VueFlow>
    </div>
  </NuxtLayout>
</template>

<style lang="scss">
@import "@vue-flow/controls/dist/style.css";
@import "@vue-flow/core/dist/style.css";
@import "@vue-flow/core/dist/theme-default.css";
@import "@vue-flow/minimap/dist/style.css";
@import "@vue-flow/node-resizer/dist/style.css";
</style>
