<script setup lang="ts">
import type { GraphEdge } from "#shared/models/flowchartEditor/data/GraphEdge";
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";

import { NodeTypeMap } from "@/services/flowchartEditor/NodeTypeMap";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { Background } from "@vue-flow/background";
import { Panel, useVueFlow, VueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";

const flowchartEditorStore = useFlowchartEditorStore();
const { loadContent, saveFlowchartEditor } = flowchartEditorStore;
const { flowchartEditor, isSidebarOpen } = storeToRefs(flowchartEditorStore);
const { addEdges, onConnect } = useVueFlow();
const { onDragLeave, onDragOver, onDrop } = useDragAndDrop();

onConnect(addEdges);
const isLoaded = ref(false);
onMounted(async () => {
  await loadContent();
  isLoaded.value = true;
});
</script>

<template>
  <StyledSkeleton v-if="!isLoaded" />
  <VueFlow
    v-else
    h-full
    :node-types="
      Object.fromEntries(Object.entries(NodeTypeMap).map(([nodeType, { component }]) => [nodeType, component]))
    "
    :nodes="flowchartEditor.nodes"
    :edges="flowchartEditor.edges"
    @update:nodes="
      async (newNodes) => {
        flowchartEditor.nodes = newNodes as GraphNode[];
        await saveFlowchartEditor();
      }
    "
    @update:edges="
      async (newEdges) => {
        flowchartEditor.edges = newEdges as GraphEdge[];
        await saveFlowchartEditor();
      }
    "
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <Background />
    <MiniMap bg-surface />
    <FlowchartEditorControls />
    <FlowchartEditorSideBarButton />
    <Panel v-if="isSidebarOpen" position="top-left">
      <v-sheet w-64 max-h-full overflow-y-auto rd-1 elevation="4">
        <FlowchartEditorSideBar />
      </v-sheet>
    </Panel>
    <FlowchartEditorPanel />
    <FlowchartEditorDropzoneBackground />
  </VueFlow>
</template>

<style lang="scss">
@use "@vue-flow/controls/dist/style.css" as *;
@use "@vue-flow/core/dist/style.css" as *;
@use "@vue-flow/core/dist/theme-default.css";
@use "@vue-flow/minimap/dist/style.css" as *;
@use "@vue-flow/node-resizer/dist/style.css" as *;
</style>

<style scoped lang="scss">
:deep(.selected .line) {
  border-style: dashed;
}
</style>
