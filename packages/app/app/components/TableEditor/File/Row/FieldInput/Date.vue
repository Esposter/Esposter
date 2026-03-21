<script setup lang="ts">
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";

import { dayjs } from "#shared/services/dayjs";

interface FieldInputDateProps {
  column: DateColumn;
}

const { column } = defineProps<FieldInputDateProps>();
const modelValue = defineModel<null | string>({ required: true });
const displayModelValue = computed(() => {
  if (typeof modelValue.value !== "string") return modelValue.value;
  const date = dayjs(modelValue.value, column.format, true);
  return date.isValid() ? date.format("YYYY-MM-DD") : modelValue.value;
});
</script>

<template>
  <v-text-field
    :model-value="displayModelValue"
    :label="column.name"
    type="date"
    density="compact"
    @update:model-value="modelValue = $event ? dayjs($event, 'YYYY-MM-DD').format(column.format) : $event"
  />
</template>
