<script setup lang="ts">
import type { VForm } from "vuetify/components";

import { takeOne } from "@esposter/shared";
import { z } from "zod";

interface ErrorIconProps {
  editedValue: unknown;
  editForm: InstanceType<typeof VForm> | undefined;
  isEditFormValid: boolean;
  schema: z.ZodType;
}

const { editedValue, editForm, isEditFormValid, schema } = defineProps<ErrorIconProps>();
const errorMessage = computed(() => {
  const error = editForm?.errors[0];
  if (error) {
    const errorText = takeOne(error.errorMessages);
    const element = document.querySelector(`label[for="${error.id}"]`);
    return element ? `${element.textContent}: ${errorText}` : errorText;
  }

  const result = schema.safeParse(editedValue);
  return result.success ? "" : z.prettifyError(result.error);
});
const isValid = computed(() => isEditFormValid && !errorMessage.value);

defineExpose({ isValid });
</script>

<template>
  <v-tooltip :text="errorMessage" :disabled="!errorMessage">
    <template #activator="{ props }">
      <v-icon icon="mdi-alert-octagon" :color="isValid ? 'border' : 'error'" start :="props" />
    </template>
  </v-tooltip>
</template>
