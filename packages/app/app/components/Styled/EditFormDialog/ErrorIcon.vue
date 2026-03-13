<script setup lang="ts">
import type { VForm } from "vuetify/components";
import type { z } from "zod";

import { takeOne } from "@esposter/shared";
import { z as zod } from "zod";

interface ErrorIconProps {
  editFormRef?: InstanceType<typeof VForm> | undefined;
  isEditFormValid: boolean;
  schema?: z.ZodType;
  value?: unknown;
}

const { editFormRef, isEditFormValid, schema, value } = defineProps<ErrorIconProps>();
const schemaError = ref("");
const isValid = computed(() => isEditFormValid && !schemaError.value);
const errorMessage = computed(() => {
  const error = editFormRef?.errors[0];
  if (error) {
    const element = document.querySelector(`label[for="${error.id}"]`);
    if (element) return `${element.textContent}: ${takeOne(error.errorMessages)}`;
  }

  return schemaError.value;
});

watchDeep(
  () => value,
  (newValue) => {
    if (!schema) {
      schemaError.value = "";
      return;
    }

    const result = schema.safeParse(newValue);
    schemaError.value = result.success ? "" : zod.prettifyError(result.error);
  },
);
</script>

<template>
  <v-tooltip :text="errorMessage" :disabled="!errorMessage">
    <template #activator="{ props }">
      <v-icon icon="mdi-alert-octagon" :color="isValid ? 'border' : 'error'" start :="props" />
    </template>
  </v-tooltip>
</template>
