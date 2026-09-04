<script setup lang="ts">
import type { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";

import { ISO_DATE_FORMAT } from "#shared/util/date/constants";
import { formatDate } from "#shared/util/date/formatDate";
import { parseDate } from "#shared/util/date/parseDate";

interface Props {
  column: DateColumn;
  isInline?: true;
}

const { column, isInline } = defineProps<Props>();
const modelValue = defineModel<null | string>({ required: true });
const displayModelValue = computed(() => {
  if (typeof modelValue.value !== "string") return modelValue.value;
  const date = parseDate(modelValue.value, column.format);
  // eslint-disable-next-line no-restricted-syntax -- the ISO value the date input reads, not text a reader sees
  return date ? formatDate(date, ISO_DATE_FORMAT) : modelValue.value;
});
const onUpdateModelValue = (newModelValue: null | string) => {
  const date = newModelValue ? parseDate(newModelValue, ISO_DATE_FORMAT) : undefined;
  // eslint-disable-next-line no-restricted-syntax -- writes the cell's stored value in the column's own format
  modelValue.value = date ? formatDate(date, column.format) : newModelValue;
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
