<script setup lang="ts">
const emit = defineEmits<{
  "update:update-mode": [value: true];
}>();
</script>

<template>
  <v-tooltip text="Edit Comment">
    <template #activator="{ props }">
      <v-btn rd-none="!" icon="mdi-pencil" size="small" :="props" @click="emit('update:update-mode', true)" />
    </template>
  </v-tooltip>
</template>
