<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { useVisualStore } from "@/store/dashboard/visual";

interface VisualPreviewContainerProps {
  id: Visual["id"];
  type: Visual["type"];
}

const { id, type } = defineProps<VisualPreviewContainerProps>();
const visualStore = useVisualStore();
const { editItem } = visualStore;
const { editedItem } = storeToRefs(visualStore);
const container = useTemplateRef("container");

onClickExceptDrag(
  container,
  getSynchronizedFunction(() => editItem({ id })),
);
</script>

<template>
  <div ref="container">
    <DashboardVisualPreview :type />
    <DashboardVisualPreviewRemoveButton :id :type />
    <DashboardVisualPreviewEditFormDialog v-if="editedItem?.id === id" v-model="editedItem" />
  </div>
</template>
