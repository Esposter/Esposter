<script setup lang="ts">
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
    <StyledCard p-4>
      <!-- Backspace removes a node too, but nothing on screen names it — draw.io and Miro both hang a delete
        Off the selection itself, and this panel is already the thing that appears when one is made -->
      <v-card-title font-bold flex gap-x-2 items-center>
        Properties
        <v-spacer />
        <StyledTooltipIconButton
          :button-props="{ size: 'small' }"
          icon="mdi-delete"
          text="Delete Node"
          @click="removeNodes(firstSelectedNode.id)"
        />
      </v-card-title>
      <v-card-text>
        <FlowchartEditorPanelContent
          :id="firstSelectedNode.id"
          :data="firstSelectedNode.data"
          :style="firstSelectedNode.style"
        />
      </v-card-text>
    </StyledCard>
  </Panel>
</template>
