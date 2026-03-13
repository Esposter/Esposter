<script setup lang="ts">
import type { VForm } from "vuetify/components";
import type { z } from "zod";

import { takeOne } from "@esposter/shared";
import { z as zod } from "zod";

interface ErrorIconProps {
  editedValue: unknown;
  editFormRef: InstanceType<typeof VForm> | undefined;
  isEditFormValid: boolean;
  schema: z.ZodType;
}

const { editedValue, editFormRef, isEditFormValid, schema } = defineProps<ErrorIconProps>();
const errorMessage = computed(() => {
  const error = editFormRef?.errors[0];
  if (error) {
    const element = document.querySelector(`label[for="${error.id}"]`);
    if (element) return `${element.textContent}: ${takeOne(error.errorMessages)}`;
  }

  const result = schema.safeParse(editedValue);
  return result.success ? "" : zod.prettifyError(result.error);
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
