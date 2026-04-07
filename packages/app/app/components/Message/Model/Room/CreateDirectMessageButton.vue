<script setup lang="ts">
const isOpen = defineModel<boolean>({ default: false });
</script>

<template>
  <v-tooltip text="New Message">
    <template #activator="{ props }">
      <v-btn icon="mdi-plus" variant="plain" size="small" :ripple="false" :="props" @click="isOpen = true" />
    </template>
  </v-tooltip>
  <MessageModelRoomCreateDirectMessageDialog v-model="isOpen" />
</template>
