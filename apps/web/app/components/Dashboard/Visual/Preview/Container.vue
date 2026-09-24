<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useVisualStore } from "@/store/dashboard/visual";

interface Props {
  id: Visual["id"];
  type: Visual["type"];
}

const { id, type } = defineProps<Props>();
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
    <!-- Clicking the tile opens its edit form, which nothing on screen says on its own — Power BI puts edit
      And delete together on the tile's own corner, so the pair sits there here too. The delete's dialog sits in this
      Corner's DOM, so nothing pressed here reaches the tile's click or its drag tracking -->
    <div flex gap-1 right-1 top-1 absolute @click.stop @mousedown.stop @mousemove.stop>
      <UiIconButton
        label="Edit visual"
        :meaning="UiIconMeaning.Edit"
        :variant="UiButtonVariant.Quiet"
        @click="editItem({ id })"
      />
      <DashboardVisualPreviewDeleteButton :id :type />
    </div>
    <DashboardVisualPreviewEditFormDialog v-if="editedItem?.id === id" v-model="editedItem" />
  </div>
</template>
