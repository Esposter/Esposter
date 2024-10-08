<script setup lang="ts">
const emit = defineEmits<{
  "update:delete-mode": [value: true];
}>();
</script>

<template>
  <v-tooltip text="Delete Comment">
    <template #activator="{ props }">
      <v-btn rd-none="!" icon="mdi-delete" size="small" :="props" @click="emit('update:delete-mode', true)" />
    </template>
  </v-tooltip>
</template>
