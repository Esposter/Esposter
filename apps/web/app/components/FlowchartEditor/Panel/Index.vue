<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { takeOne } from "@esposter/shared";
import { Panel, useVueFlow } from "@vue-flow/core";

const flowchartEditorStore = useFlowchartEditorStore();
const { flowchartEditor } = storeToRefs(flowchartEditorStore);
// Selection is the canvas's own state, never the saved graph's; the node it names is read back from the graph
const { getSelectedNodes, removeNodes } = useVueFlow();
const selectedNode = computed(() => {
  if (getSelectedNodes.value.length !== 1) return undefined;
  const { id } = takeOne(getSelectedNodes.value);
  return flowchartEditor.value.nodes.find((node) => node.id === id);
});
</script>

<template>
  <Panel v-if="selectedNode" position="top-right">
    <div p-3 flex flex-col gap-3 w-72 ui-lifted>
      <!-- Backspace removes a node too, but nothing on screen names it — draw.io and Miro both hang a delete
        Off the selection itself, and this panel is already the thing that appears when one is made -->
      <div flex gap-2 items-center>
        <h2 flex-1 ui-heading>Properties</h2>
        <UiIconButton
          label="Delete node"
          :meaning="UiIconMeaning.Delete"
          :variant="UiButtonVariant.Quiet"
          @click="removeNodes(selectedNode.id)"
        />
      </div>
      <FlowchartEditorPanelContent :id="selectedNode.id" :data="selectedNode.data" :style="selectedNode.style" />
    </div>
  </Panel>
</template>
