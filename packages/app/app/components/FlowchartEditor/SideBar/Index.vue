<script setup lang="ts">
import { NodeCategoryTypeMap } from "@/services/flowchartEditor/NodeCategoryTypeMap";
import { NodeTypeMap } from "@/services/flowchartEditor/NodeTypeMap";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";

const { height, width } = useWindowSize();
const flowchartEditorStore = useFlowchartEditorStore();
const { isSidebarOpen } = storeToRefs(flowchartEditorStore);
const { createNode, onDragStart } = useDragAndDrop();
const NODE_CATEGORY_TYPES = Object.entries(NodeCategoryTypeMap);
</script>

<template>
  <div flex flex-col h-full>
    <v-list flex flex-1 flex-col gap-y-4 items-center>
      <v-expansion-panels variant="accordion">
        <v-expansion-panel
          v-for="[nodeCategory, nodeTypes] of NODE_CATEGORY_TYPES"
          :key="nodeCategory"
          :title="nodeCategory"
        >
          <v-expansion-panel-text>
            <template v-for="nodeType of nodeTypes" :key="nodeType">
              <v-tooltip :text="nodeType">
                <template #activator="{ props }">
                  <component
                    :is="NodeTypeMap[nodeType].preview"
                    rd-1
                    size-auto
                    :draggable="true"
                    :="props"
                    @dragstart="onDragStart($event)"
                    @click="createNode({ x: width / 2, y: height / 2 })"
                  />
                </template>
              </v-tooltip>
            </template>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-list>
    <StyledTooltipIconButton
      :button-props="{ class: 'self-end' }"
      icon="mdi-chevron-double-left"
      text="Collapse sidebar"
      @click="isSidebarOpen = false"
    />
  </div>
</template>
