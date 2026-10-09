<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { takeOne } from "@esposter/shared";
import { Panel, useVueFlow } from "@vue-flow/core";

const flowchartEditorStore = useFlowchartEditorStore();
const { flowchartEditor } = storeToRefs(flowchartEditorStore);
// Selection is the canvas's own state, never the saved graph's; the node or edge it names is read back from the graph
const { getSelectedEdges, getSelectedNodes, removeEdges, removeNodes } = useVueFlow();
const selectedNode = computed(() => {
  if (getSelectedNodes.value.length !== 1) return undefined;
  const { id } = takeOne(getSelectedNodes.value);
  return flowchartEditor.value.nodes.find((node) => node.id === id);
});
// A node chosen alongside an edge keeps the panel to itself, so the two never stack
const selectedEdge = computed(() => {
  if (selectedNode.value || getSelectedEdges.value.length !== 1) return undefined;
  const { id } = takeOne(getSelectedEdges.value);
  return flowchartEditor.value.edges.find((edge) => edge.id === id);
});
const deleteLabel = computed(() => (selectedNode.value ? "Delete node" : "Delete connector"));
const isDeleteOpen = ref(false);
const deleteSelected = () => {
  if (selectedNode.value) removeNodes(selectedNode.value.id);
  else if (selectedEdge.value) removeEdges(selectedEdge.value.id);
};
</script>

<template>
  <Panel v-if="selectedNode || selectedEdge" position="top-right">
    <div p-3 flex flex-col gap-3 w-72 ui-lifted>
      <!-- Backspace removes a node or an edge too, but nothing on screen names it — draw.io and Miro both hang a delete
        Off the selection itself, and this panel is already the thing that appears when one is made -->
      <div flex gap-2 items-center>
        <h2 flex-1 ui-heading>Properties</h2>
        <UiIconButton
          :label="deleteLabel"
          :meaning="UiIconMeaning.Delete"
          :variant="UiButtonVariant.Quiet"
          @click="isDeleteOpen = true"
        />
        <UiConfirmDialog v-model="isDeleteOpen" confirm-label="Delete" :title="deleteLabel" :confirm="deleteSelected">
          <p v-if="selectedNode">Delete this node and the edges joined to it?</p>
          <p v-else>Delete this connector?</p>
        </UiConfirmDialog>
      </div>
      <FlowchartEditorPanelContent
        v-if="selectedNode"
        :id="selectedNode.id"
        :data="selectedNode.data"
        :style="selectedNode.style"
      />
      <FlowchartEditorPanelEdgeContent
        v-else-if="selectedEdge"
        :id="selectedEdge.id"
        :label="selectedEdge.label"
        :type="selectedEdge.type"
      />
    </div>
  </Panel>
</template>
