<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

import { USER_BIOGRAPHY_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  isEditMode: boolean;
  label: string;
  value: Row<RowValueType.Textarea>["value"];
}

const modelValue = defineModel<Row<RowValueType.Textarea>["value"]>({ required: true });
const { isEditMode, label, value } = defineProps<Props>();
const rules = useVRules();
const valueRules = computed(() => [rules.maxLength(USER_BIOGRAPHY_MAX_LENGTH)]);
</script>

<template>
  <UiTextField
    v-if="isEditMode"
    :model-value="modelValue ?? ''"
    :label
    :rows="3"
    :rules="valueRules"
    @update:model-value="modelValue = $event"
  />
  <UserProfileCardField v-else :label ws-pre-wrap>{{ value }}</UserProfileCardField>
</template>
