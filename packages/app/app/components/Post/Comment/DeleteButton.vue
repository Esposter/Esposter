<script setup lang="ts">
const emit = defineEmits<{
  "update:delete-mode": [value: true];
}>();
</script>

<template>
  <v-tooltip text="Delete Comment">
    <template #activator="{ props }">
      <v-btn icon="mdi-delete" size="small" tile :="props" @click="emit('update:delete-mode', true)" />
    </template>
  </v-tooltip>
</template>
