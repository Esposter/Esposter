<script setup lang="ts">
import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { BooleanFilterValue } from "@/models/resource/sheet/column/BooleanFilterValue";
import type { ColumnFilter } from "@/models/resource/sheet/column/ColumnFilter";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { BooleanFilterValueItemCategoryDefinitions } from "@/services/resource/sheet/column/BooleanFilterValueItemCategoryDefinitions";

interface Props {
  column: Column;
}

const { column } = defineProps<Props>();
const modelValue = defineModel<ColumnFilter | undefined>({ required: true });
const booleanValue = computed<BooleanFilterValue>({
  get: () => (modelValue.value?.type === ColumnType.Boolean ? modelValue.value.value : ""),
  set: (value) => {
    modelValue.value = value ? { type: ColumnType.Boolean, value } : undefined;
  },
});
const minimumValue = computed({
  get: () => (modelValue.value?.type === ColumnType.Number ? modelValue.value.minimum : ""),
  set: (minimum) => {
    const maximum = modelValue.value?.type === ColumnType.Number ? modelValue.value.maximum : "";
    modelValue.value = minimum !== "" || maximum !== "" ? { maximum, minimum, type: ColumnType.Number } : undefined;
  },
});
const maximumValue = computed({
  get: () => (modelValue.value?.type === ColumnType.Number ? modelValue.value.maximum : ""),
  set: (maximum) => {
    const minimum = modelValue.value?.type === ColumnType.Number ? modelValue.value.minimum : "";
    modelValue.value = minimum !== "" || maximum !== "" ? { maximum, minimum, type: ColumnType.Number } : undefined;
  },
});
const stringValue = computed({
  get: () => {
    if (modelValue.value?.type === ColumnType.Date || modelValue.value?.type === ColumnType.String)
      return modelValue.value.value;
    else return "";
  },
  set: (value) => {
    if (column.type !== ColumnType.Boolean && column.type !== ColumnType.Computed && column.type !== ColumnType.Number)
      modelValue.value = value ? { type: column.type, value } : undefined;
  },
});
</script>

<template>
  <UiSelect
    v-if="column.type === ColumnType.Boolean"
    v-model="booleanValue"
    :items="BooleanFilterValueItemCategoryDefinitions"
    :label="`Filter ${column.name}`"
  />
  <div v-else-if="column.type === ColumnType.Number" flex gap-1>
    <UiTextField
      v-model="minimumValue"
      is-label-hidden
      :label="`Minimum of ${column.name}`"
      placeholder="Minimum"
      :type="UiTextFieldType.Number"
    />
    <UiTextField
      v-model="maximumValue"
      is-label-hidden
      :label="`Maximum of ${column.name}`"
      placeholder="Maximum"
      :type="UiTextFieldType.Number"
    />
  </div>
  <UiTextField v-else v-model="stringValue" is-label-hidden :label="`Filter ${column.name}`" placeholder="Filter" />
</template>
