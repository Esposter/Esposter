<script setup lang="ts">
import { NodeCategoryTypeMap } from "@/services/flowchartEditor/NodeCategoryTypeMap";
import { NodeTypeMap } from "@/services/flowchartEditor/NodeTypeMap";
import { useLayoutStore } from "@/store/layout";

const layoutStore = useLayoutStore();
const { leftDrawerOpen, leftDrawerOpenAuto } = storeToRefs(layoutStore);
const { onDragStart } = useDragAndDrop();
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
              <v-row>
                <v-col cols="3">
                  <component
                    :is="NodeTypeMap[nodeType].preview"
                    cursor-pointer
                    :draggable="true"
                    @dragstart="onDragStart($event)"
                  />
                </v-col>
              </v-row>
            </template>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-list>
    <v-btn v-if="!leftDrawerOpenAuto" self-end icon="mdi-chevron-double-left" @click="leftDrawerOpen = false" />
  </div>
</template>
