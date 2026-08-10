<script setup lang="ts">
const modelValue = defineModel<boolean>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <MessageModelRoomSettingsField hint="Only members with Manage Messages permission can post." title="Read-only">
    <v-switch v-model="modelValue" color="primary" hide-details @update:model-value="emit('save')" />
  </MessageModelRoomSettingsField>
</template>
