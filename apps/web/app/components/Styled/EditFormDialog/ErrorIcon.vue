<script setup lang="ts">
import type { VForm } from "vuetify/components";

import { takeOne } from "@esposter/shared";
import { z } from "zod";

interface Props {
  editedValue?: unknown;
  editForm?: InstanceType<typeof VForm>;
  isEditFormValid: boolean;
  schema?: z.ZodType;
}

const { editedValue, editForm, isEditFormValid, schema } = defineProps<Props>();
const errorMessage = computed(() => {
  const error = editForm?.errors[0];
  if (error) {
    const errorText = takeOne(error.errorMessages);
    // Safe to read the DOM from a computed: an error only exists once the form has validated on the client, and
    // The form is a template ref, so there is nothing to validate during the server render
    const element = window.document.querySelector(`label[for="${error.id}"]`);
    return element ? `${element.textContent}: ${errorText}` : errorText;
  }

  if (!schema) return "";
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
