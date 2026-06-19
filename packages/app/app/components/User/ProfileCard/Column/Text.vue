<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

import { USER_NAME_MAX_LENGTH } from "@esposter/db-schema";

export interface UserProfileCardColumnTextProps {
  editMode: boolean;
  value: Row<RowValueType.Text>["value"];
}

const modelValue = defineModel<Row<RowValueType.Text>["value"]>({ required: true });
const { editMode, value } = defineProps<UserProfileCardColumnTextProps>();
const rules = useVRules();
</script>

<template>
  <v-col font-bold self-center cols="6">
    <v-text-field
      v-if="editMode"
      v-model="modelValue"
      size="small"
      :rules="[rules.required(), rules.maxLength(USER_NAME_MAX_LENGTH), rules.isNotProfanity()]"
    />
    <template v-else>
      {{ value }}
    </template>
  </v-col>
</template>
