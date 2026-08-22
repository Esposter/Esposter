<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VisualTypeChartTypesMap } from "@/services/dashboard/chart/VisualTypeChartTypesMap";
import { VisualTypeItemCategoryDefinitions } from "@/services/dashboard/VisualTypeItemCategoryDefinitions";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { useVisualStore } from "@/store/dashboard/visual";
import { takeOne } from "@esposter/shared";
import { Vjsf } from "@koumoul/vjsf";

const editedItem = defineModel<Visual>({ required: true });
const visualStore = useVisualStore();
const { resetItem, save } = visualStore;
const { editForm, editFormDialog, isDirty, isEditFormValid, isFullScreenDialog, isSavable } = storeToRefs(visualStore);
const schema = useZodSchema(
  () => editedItem.value.chart.type,
  () => editedItem.value.type,
);
const jsonSchema = computed(() => zodToJsonSchema(schema.value));
</script>

<template>
  <StyledEditFormDialog
    v-model="editFormDialog"
    v-model:is-full-screen-dialog="isFullScreenDialog"
    :name="`${editedItem.chart.type} ${editedItem.type} Visual`"
    :edited-item
    :is-dirty
    :is-edit-form-valid
    :is-savable
    :schema
    @close="resetItem()"
    @save="save(editedItem)"
    @update:edit-form="editForm = $event"
  >
    <template #prepend-form>
      <!-- What the visual *is*, chosen on the visual rather than in the toolbar that adds it: every reference
        dashboard (Grafana, Power BI, Looker) picks the visualization inside the panel, where the data it is
        being drawn from is visible and the choice is still changeable afterwards -->
      <v-select
        label="Visual Type"
        :items="VisualTypeItemCategoryDefinitions"
        :model-value="editedItem.type"
        @update:model-value="
          (type) => {
            editedItem.type = type;
            // Chart types are per visual type, so a switch that leaves the old one unavailable falls back to
            // The first the new type offers rather than keeping a value its own schema does not accept
            const chartTypes = VisualTypeChartTypesMap[type];
            if (!chartTypes.includes(editedItem.chart.type)) editedItem.chart.type = takeOne(chartTypes);
          }
        "
      />
      <v-select v-model="editedItem.chart.type" :items="VisualTypeChartTypesMap[editedItem.type]" label="Chart Type" />
      <DashboardVisualPreviewDatasetBindingForm v-model="editedItem.dataset" />
    </template>
    <Vjsf v-model="editedItem.chart.configuration" :schema="jsonSchema" />
  </StyledEditFormDialog>
</template>
