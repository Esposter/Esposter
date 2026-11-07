<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { VisualDatasetShape } from "@/models/dashboard/VisualDatasetShape";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { VisualTypeChartTypesMap } from "@/services/dashboard/chart/VisualTypeChartTypesMap";
import { checkIsChartVisualType } from "@/services/dashboard/checkIsChartVisualType";
import { VisualTypeDatasetShapeMap } from "@/services/dashboard/dataset/VisualTypeDatasetShapeMap";
import { setVisualType } from "@/services/dashboard/setVisualType";
import { VisualTypeCategoryDefinitions } from "@/services/dashboard/VisualTypeCategoryDefinitions";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";

// The draft of the selected visual, which the store copied when the visual was selected and which is not the visual itself
const editedItem = defineModel<Visual>({ required: true });
const visualStore = useVisualStore();
const { applyEdit } = visualStore;
const schema = useZodSchema(
  () => editedItem.value.chart.type,
  () => editedItem.value.type,
);
// A valid draft is written onto its visual as it changes, so the tile redraws at once and the dashboard's autosave persists
// It. A draft the schema refuses stays in the form and is written nowhere, so an invalid value reaches neither the tile nor a save
watchDeep(editedItem, (newEditedItem) => {
  if (schema.value.safeParse(newEditedItem.chart.configuration).success) applyEdit(newEditedItem);
});
const jsonSchema = computed(() => zodToJsonSchema(schema.value));
// A card and a table draw no chart, so the chart type and the chart's settings have nothing to set for them
const isChartVisual = computed(() => checkIsChartVisualType(editedItem.value.type));
// A group is made from the palette and keeps its type, so a chart's type picker offers every type but the group's
const visualTypeItems = VisualTypeCategoryDefinitions.flatMap(({ items }) => items).filter(
  ({ value }) => value !== VisualType.Group,
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
  <!-- What the visual *is*, chosen on the visual rather than in the toolbar that adds it: every reference
    dashboard (Grafana, Power BI, Looker) picks the visualization inside the panel, where the data it is
    being drawn from is visible and the choice is still changeable afterwards -->
  <UiForm p-3 flex flex-1 flex-col gap-4 min-h-0 of-y-auto>
    <div flex flex-wrap gap-3>
      <div flex flex-col gap-1 w-64>
        <span text-sm text-muted>Visual type</span>
        <UiSelect
          :items="visualTypeItems"
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
      A {{ prettify(editedItem.type) }} draws several values per point, and a dataset binding gives one aggregated value
      per category, so this visual shows demo data.
    </p>
    <DashboardVisualPreviewDatasetBindingForm v-else v-model="editedItem.dataset" />
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
  </UiForm>
</template>
