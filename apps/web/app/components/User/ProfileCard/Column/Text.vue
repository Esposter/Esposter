<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

import { UiRules } from "@/services/ui/UiRules";
import { USER_NAME_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  isEditMode: boolean;
  label: string;
  value: Row<RowValueType.Text>["value"];
}

const modelValue = defineModel<Row<RowValueType.Text>["value"]>({ required: true });
const { isEditMode, label, value } = defineProps<Props>();
const valueRules = [UiRules.required(), UiRules.maxLength(USER_NAME_MAX_LENGTH), UiRules.isNotProfanity()];
</script>

<template>
  <UiTextField
    v-if="isEditMode"
    :model-value="modelValue ?? ''"
    :label
    :rules="valueRules"
    @update:model-value="modelValue = $event"
  />
  <UserProfileCardField v-else :label>{{ value }}</UserProfileCardField>
</template>
