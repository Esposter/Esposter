<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
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
    <!-- Clicking the tile opens its edit form and nothing on screen said so, while deleting one has carried a
      Visible control all along — Power BI puts both on the tile's own corner, so the pair sits together here -->
    <div flex right-0 top-0 absolute>
      <StyledTooltipIconButton
        :button-props="{ size: 'small' }"
        icon="mdi-pencil"
        text="Edit Visual"
        @click.stop="editItem({ id })"
      />
      <DashboardVisualPreviewDeleteButton :id :type />
    </div>
    <DashboardVisualPreviewEditFormDialog v-if="editedItem?.id === id" v-model="editedItem" />
  </div>
</template>
