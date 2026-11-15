<script setup lang="ts" generic="TType extends RowValueType">
import type { Row } from "#src/models/user/ProfileCard/Row";
import type { RowValueType } from "#src/models/user/ProfileCard/RowValueType";

import { RowValueComponentMap } from "#src/services/user/RowValueComponentMap";
import { toTitleCase } from "#src/util/text/toTitleCase";

interface Props<TType extends RowValueType> {
  isEditMode: boolean;
  row: Row<TType>;
  title: string;
}

const modelValue = defineModel<Row<TType>["value"]>({ required: true });
const { isEditMode, row } = defineProps<Props<TType>>();

watch(
  () => isEditMode,
  (newIsEditMode) => {
    if (!newIsEditMode) modelValue.value = row.value;
  },
);
</script>

<template>
  <component
    :is="RowValueComponentMap[row.type]"
    v-model="modelValue"
    :is-edit-mode
    :label="toTitleCase(title)"
    :value="row.value"
  />
</template>
