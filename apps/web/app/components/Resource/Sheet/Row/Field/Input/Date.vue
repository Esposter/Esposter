<script setup lang="ts">
import type { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";

import { formatDate } from "#shared/util/date/formatDate";
import { parseDate } from "#shared/util/date/parseDate";

interface Props {
  column: DateColumn;
  isInline?: true;
}

const { column, isInline } = defineProps<Props>();
const modelValue = defineModel<null | string>({ required: true });
// The cell stores its day as text in the column's own format, which the field reads and writes as the instant it names
const date = computed({
  get: () => (modelValue.value ? (parseDate(modelValue.value, column.format) ?? null) : null),
  set: (newDate) => {
    // eslint-disable-next-line no-restricted-syntax -- writes the cell's stored value in the column's own format
    modelValue.value = newDate ? formatDate(newDate, column.format) : null;
  },
});
const dateField = useTemplateRef("dateField");

// A cell opens its editor in place of its text, which the reader goes on to at once; an element added after the page
// Loaded ignores autofocus, so the editor takes focus itself
onMounted(() => {
  if (isInline) dateField.value?.element?.focus();
});
</script>

<template>
  <UiDateField ref="dateField" v-model="date" is-clearable :is-label-hidden="isInline" :label="column.name" />
</template>
