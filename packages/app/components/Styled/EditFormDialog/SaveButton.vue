<script setup lang="ts">
interface SaveButtonProps {
  isSavable: boolean;
}

const { isSavable } = defineProps<SaveButtonProps>();
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <v-tooltip text="Save & Close">
    <template #activator="{ props }">
      <v-btn :="props" icon="mdi-content-save" :disabled="!isSavable" @click="emit('save')" />
    </template>
  </v-tooltip>
</template>
