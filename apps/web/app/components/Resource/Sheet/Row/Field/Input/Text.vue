<script setup lang="ts">
import type { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import type { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { FieldInputTypeMap } from "@/services/resource/sheet/column/FieldInputTypeMap";

interface Props {
  column: NumberColumn | StringColumn;
  isInline?: true;
}

const { column, isInline } = defineProps<Props>();
const modelValue = defineModel<null | number | string>({ required: true });
const textValue = computed({
  get: () => (modelValue.value === null ? "" : String(modelValue.value)),
  set: (value) => {
    modelValue.value = column.type === ColumnType.Number ? (value ? Number(value) : null) : value || null;
  },
});
const textField = useTemplateRef("textField");

// A cell opens its editor in place of its text, which the reader starts typing into at once; an element added after the
// Page loaded ignores autofocus, so the editor takes focus itself
onMounted(() => {
  if (isInline) textField.value?.element?.focus();
});
</script>

<template>
  <UiTextField
    ref="textField"
    v-model="textValue"
    :is-label-hidden="isInline"
    :label="column.name"
    :type="FieldInputTypeMap[column.type]"
  />
</template>
