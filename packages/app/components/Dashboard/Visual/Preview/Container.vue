<script setup lang="ts">
import type { Visual } from "@/models/dashboard/Visual";

import { useVisualStore } from "@/store/dashboard/visual";
import { useTemplateRef } from "vue";

interface VisualPreviewContainerProps {
  id: Visual["id"];
  type: Visual["type"];
}

const { id, type } = defineProps<VisualPreviewContainerProps>();
const visualStore = useVisualStore();
const { editItem } = visualStore;
const { editedItem } = storeToRefs(visualStore);
const container = useTemplateRef("container");

onClickExceptDrag(container, () => {
  editItem(id);
});
</script>

<template>
  <div ref="container">
    <DashboardVisualPreview :type />
    <DashboardVisualPreviewRemoveButton :id :type />
    <DashboardVisualPreviewEditFormDialog v-if="editedItem?.id === id" v-model="editedItem" />
  </div>
</template>
