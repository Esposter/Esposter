<script setup lang="ts">
interface SaveButtonProps {
  isSavable: boolean;
}

const { isSavable } = defineProps<SaveButtonProps>();
</script>

<template>
  <v-tooltip text="Save & Close">
    <template #activator="{ props }">
      <v-btn type="submit" icon="mdi-content-save" :disabled="!isSavable" :="props" />
    </template>
  </v-tooltip>
</template>
