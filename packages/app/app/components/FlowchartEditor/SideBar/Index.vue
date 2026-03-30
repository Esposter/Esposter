<script setup lang="ts">
import { NodeCategoryTypeMap } from "@/services/flowchartEditor/NodeCategoryTypeMap";
import { NodeTypeMap } from "@/services/flowchartEditor/NodeTypeMap";
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { isLeftDrawerOpen, isLeftDrawerOpenAuto } = storeToRefs(layoutStore);
const { createNode, onDragStart } = useDragAndDrop();
const { height, width } = useWindowSize();
</script>

<template>
  <div flex flex-col h-full>
    <v-list flex flex-col items-center flex-1 gap-y-4>
      <v-expansion-panels variant="accordion">
        <v-expansion-panel
          v-for="[nodeCategory, nodeTypes] of Object.entries(NodeCategoryTypeMap)"
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
    <v-btn v-if="!isLeftDrawerOpenAuto" self-end icon="mdi-chevron-double-left" @click="isLeftDrawerOpen = false" />
  </div>
</template>
