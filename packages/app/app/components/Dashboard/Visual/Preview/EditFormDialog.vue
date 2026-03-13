<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VisualTypeChartTypesMap } from "@/services/dashboard/chart/VisualTypeChartTypesMap";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { useVisualStore } from "@/store/dashboard/visual";
import { toRawDeep } from "@esposter/shared";
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
// shallowRef breaks the reactive proxy feedback loop caused by removeAdditional: true.
// Vjsf creates a new object on every processing cycle; if the v-model is backed by a
// Pinia reactive, each new reference triggers another cycle. shallowRef.value is never
// wrapped in reactive, so Vjsf always receives back the exact reference it last emitted.
const chartConfiguration = shallowRef(toRawDeep(editedItem.value.chart.configuration));

useConfirmBeforeNavigation(isDirty);

watch(
  () => editedItem.value.chart.type,
  () => {
    chartConfiguration.value = toRawDeep(editedItem.value.chart.configuration);
  },
);

watch(chartConfiguration, (value) => {
  editedItem.value.chart.configuration = value;
});
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
      v-model="chartConfiguration"
      :schema="jsonSchema"
      :options="{ removeAdditional: true }"
    />
  </StyledEditFormDialog>
</template>
