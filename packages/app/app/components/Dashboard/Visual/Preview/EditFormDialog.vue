<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VisualTypeChartTypesMap } from "@/services/dashboard/chart/VisualTypeChartTypesMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { useVisualStore } from "@/store/dashboard/visual";
import { Vjsf } from "@koumoul/vjsf";

const editedItem = defineModel<Visual>({ required: true });
const visualStore = useVisualStore();
const { resetItem, save } = visualStore;
const { editFormDialog, editFormRef, isDirty, isEditFormValid, isFullScreenDialog, isSavable } =
  storeToRefs(visualStore);
const schema = useZodSchema(
  () => editedItem.value.chart.type,
  () => editedItem.value.type,
);
const jsonSchema = computed(() => zodToJsonSchema(schema.value));

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
    :schema
    @close="resetItem()"
    @save="save(editedItem)"
    @update:edit-form-ref="editFormRef = $event"
    @update:fullscreen-dialog="isFullScreenDialog = $event"
  >
    <template #prepend-form>
      <v-select v-model="editedItem.chart.type" :items="VisualTypeChartTypesMap[editedItem.type]" label="Chart Type" />
    </template>
    <Vjsf
      :key="editedItem.chart.type"
      v-model="editedItem.chart.configuration"
      :schema="jsonSchema"
      :options="{ removeAdditional: true }"
    />
  </StyledEditFormDialog>
</template>
