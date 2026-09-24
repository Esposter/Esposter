<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { NodeCategoryTypeEntries } from "@/services/flowchartEditor/NodeCategoryTypeMap";
import { NodeTypeMap } from "@/services/flowchartEditor/NodeTypeMap";
import { useFlowchartEditorStore } from "@/store/flowchartEditor";

const { height, width } = useWindowSize();
const flowchartEditorStore = useFlowchartEditorStore();
const { isSidebarOpen } = storeToRefs(flowchartEditorStore);
const { createNode, onDragStart } = useDragAndDrop();
const openNodeCategories = ref<string[]>([]);
</script>

<template>
  <div p-2 flex flex-col gap-2 h-full>
    <UiCollapsible
      v-for="[nodeCategory, nodeTypes] of NodeCategoryTypeEntries"
      :key="nodeCategory"
      :model-value="openNodeCategories.includes(nodeCategory)"
      @update:model-value="
        (isOpen) => {
          openNodeCategories = isOpen
            ? [...openNodeCategories, nodeCategory]
            : openNodeCategories.filter((openNodeCategory) => openNodeCategory !== nodeCategory);
        }
      "
    >
      <template #title>{{ nodeCategory }}</template>
      <div p-2 flex flex-wrap gap-2>
        <UiTooltip v-for="nodeType of nodeTypes" :key="nodeType" #default="{ activatorProps }" :label="nodeType">
          <component
            :is="NodeTypeMap[nodeType].preview"
            :draggable="true"
            :="activatorProps"
            :aria-label="nodeType"
            @dragstart="onDragStart($event)"
            @click="createNode({ x: width / 2, y: height / 2 })"
          />
        </UiTooltip>
      </div>
    </UiCollapsible>
    <UiIconButton
      label="Collapse sidebar"
      :meaning="UiIconMeaning.Previous"
      :variant="UiButtonVariant.Quiet"
      self-end
      @click="isSidebarOpen = false"
    />
  </div>
</template>
