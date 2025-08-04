<script setup lang="ts">
import type { CustomEvent, GraphNode } from "@vue-flow/core";

import { NodeType } from "#shared/models/flowchartEditor/data/NodeType";
import { NodeTypeMap } from "@/services/flowchartEditor/NodeTypeMap";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { Background } from "@vue-flow/background";
import { Panel, useVueFlow, VueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";

defineRouteRules({ ssr: false });

await useReadFlowchartEditor();
const flowchartEditorStore = useFlowchartEditorStore();
const { saveFlowchartEditor } = flowchartEditorStore;
const { flowchartEditor } = storeToRefs(flowchartEditorStore);
const { addEdges, onConnect } = useVueFlow();
const { onDragLeave, onDragOver, onDrop } = useDragAndDrop();

onConnect(addEdges);
</script>

<template>
  <NuxtLayout :left-navigation-drawer-props="{ scrim: false }" :right-navigation-drawer-props="{ scrim: false }">
    <div class="bg-surface" h-full>
      <VueFlow
        :nodes="flowchartEditor.nodes"
        :edges="flowchartEditor.edges"
        @update:nodes="
          async (newNodes) => {
            flowchartEditor.nodes = newNodes as GraphNode<unknown, Record<string, CustomEvent>, NodeType>[];
            await saveFlowchartEditor();
          }
        "
        @update:edges="
          async (newEdges) => {
            flowchartEditor.edges = newEdges;
            await saveFlowchartEditor();
          }
        "
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <Background />
        <MiniMap class="bg-surface" />
        <Panel position="top-left" />
        <FlowchartEditorSideBarButton />
        <FlowchartEditorControls />
        <FlowchartEditorDropzoneBackground />
        <template v-for="nodeType of Object.values(NodeType)" :key="nodeType" #[`node-${nodeType}`]="{ data }">
          <component :is="NodeTypeMap[nodeType].component" :data />
        </template>
      </VueFlow>
    </div>
    <template #left>
      <FlowchartEditorSideBar />
    </template>
  </NuxtLayout>
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
