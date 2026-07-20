<script setup lang="ts">
import type { GraphEdge } from "#shared/models/flowchartEditor/data/GraphEdge";
import type { GraphNode } from "#shared/models/flowchartEditor/data/GraphNode";

import { nodeTypes } from "@/services/flowchartEditor/NodeTypeMap";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { Background } from "@vue-flow/background";
import { Panel, useVueFlow, VueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/minimap/dist/style.css";
import "@vue-flow/node-resizer/dist/style.css";

const flowchartEditorStore = useFlowchartEditorStore();
const { loadContent, saveFlowchartEditor } = flowchartEditorStore;
const { flowchartEditor, isSidebarOpen } = storeToRefs(flowchartEditorStore);
const { addEdges, onConnect } = useVueFlow();
const { onDragLeave, onDragOver, onDrop } = useDragAndDrop();
const isLoading = ref(true);
// VueFlow emits on every drag frame; coalesce so overlapping saves don't fight over contentVersion
const debouncedSave = useAutosaveFn(saveFlowchartEditor);

onConnect(addEdges);

onMounted(async () => {
  await loadContent();
  isLoading.value = false;
});
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <VueFlow
    v-else
    h-full
    :node-types
    :nodes="flowchartEditor.nodes"
    :edges="flowchartEditor.edges"
    @update:nodes="
      (newNodes) => {
        flowchartEditor.nodes = newNodes as GraphNode[];
        debouncedSave();
      }
    "
    @update:edges="
      (newEdges) => {
        flowchartEditor.edges = newEdges as GraphEdge[];
        debouncedSave();
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
      <v-sheet rd-1 max-h-full w-64 overflow-y-auto elevation="4">
        <FlowchartEditorSideBar />
      </v-sheet>
    </Panel>
    <FlowchartEditorPanel />
    <FlowchartEditorNodeDropzoneBackground />
  </VueFlow>
</template>

<style scoped lang="scss">
:deep(.selected .line) {
  border-style: dashed;
}
</style>
