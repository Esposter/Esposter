<script setup lang="ts" generic="TType extends RowValueType">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

import { RowValueComponentMap } from "@/services/user/RowValueComponentMap";
import { toTitleCase } from "@/util/text/toTitleCase";

export interface UserProfileCardRowProps<TType extends RowValueType> {
  editMode: boolean;
  row: Row<TType>;
  title: string;
}

const modelValue = defineModel<Row<TType>["value"]>({ required: true });
const { editMode, row, title } = defineProps<UserProfileCardRowProps<TType>>();

watch(
  () => editMode,
  (newEditMode) => {
    if (!newEditMode) modelValue.value = row.value;
  },
);
</script>

<template>
  <v-row>
    <v-col self-center cols="6">{{ toTitleCase(title) }}:</v-col>
    <component :is="RowValueComponentMap[row.type]" v-model="modelValue" :edit-mode :value="row.value" />
  </v-row>
</template>
