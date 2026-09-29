<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useVisualStore } from "@/store/dashboard/visual";
import { getSynchronizedFunction } from "@esposter/shared";

interface Props {
  id: Visual["id"];
  type: Visual["type"];
}

const { id, type } = defineProps<Props>();
const visualStore = useVisualStore();
const { duplicateVisual, editItem } = visualStore;
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
    <!-- Clicking the tile opens its edit form, which nothing on screen says on its own — Power BI puts a visual's
      Actions on the tile's own corner, so edit, duplicate and delete sit there here too. A press here never reaches the tile's
      Drag tracking, and its click is the corner's own -->
    <div data-nested-interaction="true" flex gap-1 right-1 top-1 absolute @mousedown.stop @mousemove.stop>
      <UiIconButton
        label="Edit visual"
        :meaning="UiIconMeaning.Edit"
        :variant="UiButtonVariant.Quiet"
        @click="editItem({ id })"
      />
      <UiIconButton
        label="Duplicate visual"
        :meaning="UiIconMeaning.Copy"
        :variant="UiButtonVariant.Quiet"
        @click="duplicateVisual({ id })"
      />
      <DashboardVisualPreviewDeleteButton :id :type />
    </div>
    <DashboardVisualPreviewEditFormDialog v-if="editedItem?.id === id" v-model="editedItem" />
  </div>
</template>
