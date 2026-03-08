<script setup lang="ts">
import type { VForm } from "vuetify/components";

import { takeOne } from "@esposter/shared";

interface ErrorIconProps {
  editFormRef: InstanceType<typeof VForm> | undefined;
  formError: string;
  isEditFormValid: boolean;
}

const { editFormRef, formError, isEditFormValid } = defineProps<ErrorIconProps>();
const errorMessage = computed(() => {
  const error = editFormRef?.errors[0];
  if (error) {
    const element = document.querySelector(`label[for="${error.id}"]`);
    if (element) return `${element.textContent}: ${takeOne(error.errorMessages)}`;
  }

  return formError;
});
</script>

<template>
  <v-tooltip :text="errorMessage" :disabled="!errorMessage">
    <template #activator="{ props }">
      <v-icon icon="mdi-alert-octagon" :color="isEditFormValid ? 'border' : 'error'" start :="props" />
    </template>
  </v-tooltip>
</template>
