<script setup lang="ts">
import type { VForm } from "vuetify/components";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
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
  const parsedEditedValue = schema.safeParse(editedValue);
  return parsedEditedValue.success ? "" : z.prettifyError(parsedEditedValue.error);
});
const isValid = computed(() => isEditFormValid && !errorMessage.value);

defineExpose({ isValid });
</script>

<template>
  <!-- Marks the form's first problem in the error colour and names it on hover or focus; muted while there is none -->
  <UiTooltip #default="{ activatorProps }" :disabled="!errorMessage" :label="errorMessage || 'No problems'">
    <span
      :="activatorProps"
      :tabindex="errorMessage ? 0 : undefined"
      :class="isValid ? 'text-muted' : 'text-error'"
      flex
    >
      <UiIcon :label="errorMessage ? 'Problem' : undefined" :meaning="UiIconMeaning.Warning" />
    </span>
  </UiTooltip>
</template>
