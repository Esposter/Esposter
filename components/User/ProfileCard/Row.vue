<script setup lang="ts">
import type { Row } from "@/models/user/ProfileCard/Row";
import { RowValueType } from "@/models/user/ProfileCard/RowValueType";
import { USER_NAME_MAX_LENGTH } from "@/services/user/constants";
import { formRules } from "@/services/vuetify/formRules";
import { toTitleCase } from "@/util/text/toTitleCase";

export interface UserProfileCardRowProps {
  title: string;
  row: Row;
  editMode: boolean;
}

// This is the edited row value
const modelValue = defineModel<string | null>({ required: true });
const { title, row, editMode } = defineProps<UserProfileCardRowProps>();

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
    <v-col v-if="row.type === RowValueType.Image" self-center flex flex-wrap items-center gap-4 cols="6">
      <v-avatar>
        <v-img v-if="row.value" :src="row.value" />
      </v-avatar>
      <v-file-input
        v-if="editMode"
        my-2
        prepend-icon=""
        prepend-inner-icon="mdi-upload"
        label="Upload image"
        density="compact"
        hide-details
      />
    </v-col>
    <v-col v-else self-center cols="6" font-bold>
      <v-text-field
        v-if="editMode"
        v-model="modelValue"
        size="small"
        :rules="[formRules.required, formRules.requireAtMostNCharacters(USER_NAME_MAX_LENGTH)]"
      />
      <template v-else>
        {{ row.value }}
      </template>
    </v-col>
  </v-row>
</template>
