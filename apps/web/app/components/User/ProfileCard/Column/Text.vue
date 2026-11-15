<script setup lang="ts">
import type { Row } from "#src/models/user/ProfileCard/Row";
import type { RowValueType } from "#src/models/user/ProfileCard/RowValueType";

import { UiRules } from "#src/services/ui/UiRules";
import { USER_NAME_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  isEditMode: boolean;
  label: string;
  value: Row<typeof RowValueType.Text>["value"];
}

const modelValue = defineModel<Row<typeof RowValueType.Text>["value"]>({ required: true });
defineProps<Props>();
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
