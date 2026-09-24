<script setup lang="ts" generic="TType extends RowValueType">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

import { RowValueComponentMap } from "@/services/user/RowValueComponentMap";
import { toTitleCase } from "@/util/text/toTitleCase";

interface Props<TType extends RowValueType> {
  isEditMode: boolean;
  row: Row<TType>;
  title: string;
}

const modelValue = defineModel<Row<TType>["value"]>({ required: true });
const { isEditMode, row, title } = defineProps<Props<TType>>();

watch(
  () => isEditMode,
  (newEditMode) => {
    if (!newEditMode) modelValue.value = row.value;
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
