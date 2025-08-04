<script setup lang="ts">
import { NodeTypeMap } from "@/services/flowchartEditor/NodeTypeMap";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";
import { Panel } from "@vue-flow/core";

const flowchartEditorStore = useFlowchartEditorStore();
const { isSingleNodeSelected, selectedNodes } = storeToRefs(flowchartEditorStore);
const firstSelectedNode = computed(() => selectedNodes.value[0]);
</script>

<template>
  <Panel v-if="isSingleNodeSelected && NodeTypeMap[firstSelectedNode.type].panelContent" position="top-right">
    <StyledCard p-4>
      <v-card-title font-bold>Properties</v-card-title>
      <v-card-text>
        <component
          :is="NodeTypeMap[firstSelectedNode.type].panelContent"
          :id="firstSelectedNode.id"
          :data="firstSelectedNode.data"
          :style="firstSelectedNode.style"
        />
      </v-card-text>
    </StyledCard>
  </Panel>
</template>
