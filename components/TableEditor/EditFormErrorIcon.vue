<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { editFormRef, isEditFormValid } = storeToRefs(tableEditorStore);
const errorMessage = computed(() => {
  const error = editFormRef.value?.errors[0];
  if (!error) return "";

  const element = document.querySelector(`label[for="${error.id}"]`) as HTMLLabelElement;
  return `${element.textContent}: ${editFormRef.value?.errors[0]?.errorMessages[0]}`;
});
</script>

<template>
  <v-tooltip :text="errorMessage" :disabled="!errorMessage">
    <template #activator="{ props }">
      <v-icon icon="mdi-alert-octagon" :color="isEditFormValid ? 'border' : 'error'" start :="props" />
    </template>
  </v-tooltip>
</template>
