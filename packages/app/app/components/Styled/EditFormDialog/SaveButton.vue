<script setup lang="ts">
interface SaveButtonProps {
  formId: string;
  isSavable: boolean;
}

const { formId, isSavable } = defineProps<SaveButtonProps>();
</script>

<template>
  <v-tooltip text="Save & Close">
    <template #activator="{ props }">
      <v-btn type="submit" :form="formId" icon="mdi-content-save" :disabled="!isSavable" :="props" />
    </template>
  </v-tooltip>
</template>
