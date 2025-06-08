<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { DEFAULT_NODE_TYPE } from "@/services/flowchartEditor/constants";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { Background } from "@vue-flow/background";
import { useVueFlow, VueFlow } from "@vue-flow/core";
import { MiniMap } from "@vue-flow/minimap";

defineRouteRules({ ssr: false });

await useReadFlowchartEditor();
const flowchartEditorStore = useFlowchartEditorStore();
const { saveFlowchartEditor } = flowchartEditorStore;
const throttledSaveFlowChartEditor = useThrottleFn(
  () => saveFlowchartEditor(),
  dayjs.duration(1, "second").asMilliseconds(),
);
const { flowchartEditor } = storeToRefs(flowchartEditorStore);
const { addEdges, onConnect, onEdgesChange, onNodesChange } = useVueFlow();
const { onDragLeave, onDragOver, onDrop } = useDragAndDrop();

onConnect((connection) => {
  addEdges(connection);
});

onEdgesChange(getSynchronizedFunction(throttledSaveFlowChartEditor));

onNodesChange(getSynchronizedFunction(throttledSaveFlowChartEditor));
</script>

<template>
  <NuxtLayout :left-navigation-drawer-props="{ scrim: false }" :right-navigation-drawer-props="{ scrim: false }">
    <div class="bg-surface" h-full @drop="onDrop">
      <VueFlow
        v-model:nodes="flowchartEditor.nodes"
        v-model:edges="flowchartEditor.edges"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
      >
        <Background />
        <FlowchartEditorSideBarButton />
        <FlowchartEditorControls />
        <MiniMap class="bg-surface" />
        <FlowchartEditorDropzoneBackground />
        <template #[`node-${DEFAULT_NODE_TYPE}`]="{ data }">
          <FlowchartEditorBaseNode :data />
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
