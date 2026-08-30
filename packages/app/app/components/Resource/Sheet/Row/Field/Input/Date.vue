<script setup lang="ts">
import type { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";

import { dayjs } from "#shared/services/dayjs";
import { ISO_DATE_FORMAT } from "#shared/services/dayjs/constants";

interface FieldInputDateProps {
  column: DateColumn;
  isInline?: true;
}

const { column, isInline } = defineProps<FieldInputDateProps>();
const modelValue = defineModel<null | string>({ required: true });
const displayModelValue = computed(() => {
  if (typeof modelValue.value !== "string") return modelValue.value;
  const date = dayjs(modelValue.value, column.format, true);
  return date.isValid() ? date.format(ISO_DATE_FORMAT) : modelValue.value;
});
const onUpdateModelValue = (newModelValue: null | string) => {
  // eslint-disable-next-line no-restricted-syntax -- writes the cell's stored value in the column's own format
  modelValue.value = newModelValue ? dayjs(newModelValue, ISO_DATE_FORMAT).format(column.format) : newModelValue;
};
</script>

<template>
  <v-text-field
    :model-value="displayModelValue"
    :label="isInline ? '' : column.name"
    :single-line="isInline"
    type="date"
    density="compact"
    @update:model-value="onUpdateModelValue"
  />
</template>
