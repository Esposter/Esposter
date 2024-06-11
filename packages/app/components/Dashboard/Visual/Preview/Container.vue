<script setup lang="ts">
import type { Visual } from "@/models/dashboard/Visual";
import { useVisualStore } from "@/store/dashboard/visual";

interface VisualPreviewContainerProps {
  id: Visual["id"];
  type: Visual["type"];
}

const { id, type } = defineProps<VisualPreviewContainerProps>();
const visualStore = useVisualStore();
const { editItem } = visualStore;
const { editedItem } = storeToRefs(visualStore);
const divRef = ref<HTMLDivElement>();

onClickExceptDrag(divRef, () => {
  editItem(id);
});
</script>

<template>
  <div ref="divRef">
    <DashboardVisualPreview :type />
    <DashboardVisualPreviewRemoveButton :id :type />
    <DashboardVisualPreviewEditFormDialog v-if="editedItem && editedItem.id === id" v-model="editedItem" />
  </div>
</template>
