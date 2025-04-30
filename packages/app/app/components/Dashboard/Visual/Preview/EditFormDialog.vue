<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VisualTypeChartTypesMap } from "@/services/dashboard/chart/VisualTypeChartTypesMap";
import { useVisualStore } from "@/store/dashboard/visual";
import { Vjsf } from "@koumoul/vjsf";

const editedItem = defineModel<Visual>({ required: true });
const visualStore = useVisualStore();
const { resetItem, save } = visualStore;
const { editFormDialog, editFormRef, isDirty, isEditFormValid, isFullScreenDialog, isSavable } =
  storeToRefs(visualStore);
const schema = useSchema(
  () => editedItem.value.chart.type,
  () => editedItem.value.type,
);

useConfirmBeforeNavigation(isDirty);
</script>

<template>
  <StyledEditFormDialog
    v-model="editFormDialog"
    :name="`${editedItem.chart.type} ${editedItem.type} Visual`"
    :edited-item
    :is-edit-form-valid
    :is-full-screen-dialog
    :is-savable
    @close="resetItem()"
    @save="save(editedItem)"
    @update:edit-form-ref="(value) => (editFormRef = value)"
    @update:fullscreen-dialog="(value) => (isFullScreenDialog = value)"
  >
    <v-container fluid>
      <v-select v-model="editedItem.chart.type" :items="VisualTypeChartTypesMap[editedItem.type]" label="Chart Type" />
      <Vjsf v-model="editedItem.chart.configuration" :schema :options="{ removeAdditional: true }" />
    </v-container>
  </StyledEditFormDialog>
</template>
