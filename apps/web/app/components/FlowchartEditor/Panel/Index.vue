<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { takeOne } from "@esposter/shared";
import { Panel, useVueFlow } from "@vue-flow/core";

const flowchartEditorStore = useFlowchartEditorStore();
const { isSingleNodeSelected, selectedNodes } = storeToRefs(flowchartEditorStore);
const firstSelectedNode = computed(() => takeOne(selectedNodes.value));
const { removeNodes } = useVueFlow();
</script>

<template>
  <Panel v-if="isSingleNodeSelected" position="top-right">
    <div p-3 flex flex-col gap-3 w-72 ui-frame>
      <!-- Backspace removes a node too, but nothing on screen names it — draw.io and Miro both hang a delete
        Off the selection itself, and this panel is already the thing that appears when one is made -->
      <div flex gap-2 items-center>
        <h2 flex-1 ui-heading>Properties</h2>
        <UiIconButton
          label="Delete node"
          :meaning="UiIconMeaning.Delete"
          :variant="UiButtonVariant.Quiet"
          @click="removeNodes(firstSelectedNode.id)"
        />
      </div>
      <FlowchartEditorPanelContent
        :id="firstSelectedNode.id"
        :data="firstSelectedNode.data"
        :style="firstSelectedNode.style"
      />
    </div>
  </Panel>
</template>
