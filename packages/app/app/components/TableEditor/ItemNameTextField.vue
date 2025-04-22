<script setup lang="ts">
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/tableEditor/constants";
import { formRules } from "@/services/vuetify/formRules";

const modelValue = defineModel<string>();
</script>

<template>
  <v-col cols="12">
    <v-text-field
      v-model="modelValue"
      label="Name"
      :rules="[formRules.required, formRules.requireAtMostNCharacters(ITEM_NAME_MAX_LENGTH)]"
    />
  </v-col>
</template>
