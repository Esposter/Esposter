<script setup lang="ts">
import type { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import type { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { FieldInputTypeMap } from "#src/services/resource/sheet/column/FieldInputTypeMap";

interface Props {
  column: NumberColumn | StringColumn;
  isInline?: true | undefined;
}

const modelValue = defineModel<null | number | string>({ required: true });
const { column } = defineProps<Props>();
const textValue = computed({
  get: () => (modelValue.value === null ? "" : String(modelValue.value)),
  set: (value) => {
    modelValue.value = column.type === ColumnType.Number ? (value ? Number(value) : null) : value || null;
  },
});
</script>

<template>
  <!-- A cell opens its editor in place of its text, which the reader starts typing into at once -->
  <UiTextField
    v-model="textValue"
    :is-autofocus="isInline"
    :is-label-hidden="isInline"
    :label="column.name"
    :type="FieldInputTypeMap[column.type]"
  />
</template>
