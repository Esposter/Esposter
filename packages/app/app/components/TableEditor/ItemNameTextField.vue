<script setup lang="ts">
import { ITEM_NAME_MAX_LENGTH } from "#shared/services/tableEditor/constants";

const modelValue = defineModel<string>();
const rules = useVRules();
</script>

<template>
  <v-col cols="12">
    <v-text-field
      v-model="modelValue"
      label="Name"
      :rules="[rules.required(), rules.maxLength(ITEM_NAME_MAX_LENGTH)]"
    />
  </v-col>
</template>
