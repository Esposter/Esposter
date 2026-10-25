<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { VisualDatasetShape } from "@/models/dashboard/VisualDatasetShape";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { VisualTypeChartTypesMap } from "@/services/dashboard/chart/VisualTypeChartTypesMap";
import { VisualTypeDatasetShapeMap } from "@/services/dashboard/dataset/VisualTypeDatasetShapeMap";
import { setVisualType } from "@/services/dashboard/setVisualType";
import { VisualTypeItemCategoryDefinitions } from "@/services/dashboard/VisualTypeItemCategoryDefinitions";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";

const editedItem = defineModel<Visual>({ required: true });
const visualStore = useVisualStore();
const { resetItem, save } = visualStore;
const { isDirty, isEditFormDialogOpen, isEditFormValid, isSavable } = storeToRefs(visualStore);
const schema = useZodSchema(
  () => editedItem.value.chart.type,
  () => editedItem.value.type,
);
const jsonSchema = computed(() => zodToJsonSchema(schema.value));
// A card and a table draw no chart, so the chart type and the chart's settings have nothing to set for them
const isChartVisual = computed(
  () => editedItem.value.type !== VisualType.Card && editedItem.value.type !== VisualType.Table,
);
const chartTypeItems = computed(() =>
  VisualTypeChartTypesMap[editedItem.value.type].map((value) => ({
    meaning: UiIconMeaning.Chart,
    title: value,
    value,
  })),
);
</script>

<template>
  <StyledEditFormDialog
    v-model="isEditFormDialogOpen"
    v-model:is-edit-form-valid="isEditFormValid"
    :name="`${editedItem.chart.type} ${editedItem.type} Visual`"
    :title="isChartVisual ? `${prettify(editedItem.chart.type)} chart` : prettify(editedItem.type)"
    :edited-item
    :is-dirty
    :is-savable
    :item-type="editedItem.type"
    :save="() => save(editedItem)"
    :schema
    @close="resetItem()"
  >
    <template #prepend-form>
      <!-- What the visual *is*, chosen on the visual rather than in the toolbar that adds it: every reference
        dashboard (Grafana, Power BI, Looker) picks the visualization inside the panel, where the data it is
        being drawn from is visible and the choice is still changeable afterwards -->
      <div flex flex-wrap gap-3>
        <div flex flex-col gap-1 w-64>
          <span text-sm text-muted>Visual type</span>
          <UiSelect
            :items="VisualTypeItemCategoryDefinitions"
            label="Visual type"
            :model-value="editedItem.type"
            @update:model-value="(type) => setVisualType(editedItem, type)"
          />
        </div>
        <div v-if="isChartVisual" flex flex-col gap-1 w-64>
          <span text-sm text-muted>Chart type</span>
          <UiSelect v-model="editedItem.chart.type" :items="chartTypeItems" label="Chart type" />
        </div>
      </div>
      <p v-if="VisualTypeDatasetShapeMap[editedItem.type] === VisualDatasetShape.None" text-muted>
        A {{ prettify(editedItem.type) }} draws several values per point, and a dataset binding gives one aggregated
        value per category, so this visual shows demo data.
      </p>
      <DashboardVisualPreviewDatasetBindingForm v-else v-model="editedItem.dataset" />
    </template>
    <UiSchemaForm
      v-if="isChartVisual"
      v-model="editedItem.chart.configuration"
      :schema="jsonSchema"
      :validation-schema="schema"
    />
    <!-- A card's label is the title its chart configuration holds, so it saves with the rest of the visual and reads back
      as the card's heading. An empty label falls back to the aggregation of the card's column -->
    <UiTextField
      v-else-if="editedItem.type === VisualType.Card"
      v-model="editedItem.chart.configuration.title"
      label="Label"
    />
  </StyledEditFormDialog>
</template>
