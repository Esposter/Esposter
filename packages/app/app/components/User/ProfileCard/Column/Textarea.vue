<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

import { USER_BIOGRAPHY_MAX_LENGTH } from "@esposter/db-schema";

export interface UserProfileCardColumnTextareaProps {
  editMode: boolean;
  value: Row<RowValueType.Textarea>["value"];
}

const modelValue = defineModel<Row<RowValueType.Textarea>["value"]>({ required: true });
const { editMode, value } = defineProps<UserProfileCardColumnTextareaProps>();
const rules = useVRules();
</script>

<template>
  <v-col font-bold whitespace-pre-wrap self-center cols="6">
    <v-textarea
      v-if="editMode"
      v-model="modelValue"
      :rules="[rules.maxLength(USER_BIOGRAPHY_MAX_LENGTH)]"
      rows="3"
      auto-grow
    />
    <template v-else>
      {{ value }}
    </template>
  </v-col>
</template>
