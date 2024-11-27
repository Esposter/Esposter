<script setup lang="ts">
import type { VForm } from "vuetify/components";

interface ErrorIconProps {
  editFormRef: InstanceType<typeof VForm> | undefined;
  isEditFormValid: boolean;
}

const { editFormRef, isEditFormValid } = defineProps<ErrorIconProps>();
const errorMessage = computed(() => {
  const error = editFormRef?.errors[0];
  if (!error) return "";

  const element = document.querySelector(`label[for="${error.id}"]`);
  if (!element) return "";
  return `${element.textContent}: ${editFormRef.errors[0]?.errorMessages[0]}`;
});
</script>

<template>
  <v-tooltip :text="errorMessage" :disabled="!errorMessage">
    <template #activator="{ props }">
      <v-icon icon="mdi-alert-octagon" :color="isEditFormValid ? 'border' : 'error'" start :="props" />
    </template>
  </v-tooltip>
</template>
