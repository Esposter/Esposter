<script setup lang="ts">
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { VueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";

defineRouteRules({ ssr: false });

const flowchartEditorStore = useFlowchartEditorStore();
const { flowchartEditor } = storeToRefs(flowchartEditorStore);
const { onDragLeave, onDragOver, onDrop } = useDragAndDrop();
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
        <template #node-resizable="{ data }">
          <ResizableNode :data />
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
