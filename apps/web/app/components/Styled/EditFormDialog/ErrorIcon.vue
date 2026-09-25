<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { z } from "zod";

interface Props {
  editedValue?: unknown;
  // The form's own verdict, which counts every field's rules as the reader types
  isFormValid: boolean;
  schema?: z.ZodType;
}

const { editedValue, isFormValid, schema } = defineProps<Props>();
// The schema names what is wrong and where; a field's rule shows its own message under the field, so the mark only
// Says that one did
const errorMessage = computed(() => {
  if (schema) {
    const parsedEditedValue = schema.safeParse(editedValue);
    if (!parsedEditedValue.success) return z.prettifyError(parsedEditedValue.error);
  }

  return isFormValid ? "" : "A field has a problem";
});
const isValid = computed(() => !errorMessage.value);

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
