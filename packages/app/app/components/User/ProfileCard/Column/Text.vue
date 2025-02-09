<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import type { RowValueType } from "@/models/user/ProfileCard/RowValueType";

import { USER_NAME_MAX_LENGTH } from "#shared/services/user/constants";
import { formRules } from "@/services/vuetify/formRules";

export interface UserProfileCardColumnTextProps {
  editMode: boolean;
  value: Row<RowValueType.Text>["value"];
}

const modelValue = defineModel<Row<RowValueType.Text>["value"]>({ required: true });
const { editMode, value } = defineProps<UserProfileCardColumnTextProps>();
</script>

<template>
  <v-col font-bold self-center cols="6">
    <v-text-field
      v-if="editMode"
      v-model="modelValue"
      size="small"
      :rules="[formRules.required, formRules.requireAtMostNCharacters(USER_NAME_MAX_LENGTH), formRules.isNotProfanity]"
    />
    <template v-else>
      {{ value }}
    </template>
  </v-col>
</template>
