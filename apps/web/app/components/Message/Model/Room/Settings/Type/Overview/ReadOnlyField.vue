<script setup lang="ts">
const modelValue = defineModel<boolean>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <MessageModelRoomSettingsField hint="Only members with Manage Messages permission can post.">
    <UiSwitch v-model="modelValue" is-label-shown label="Read-only" @update:model-value="emit('save')" />
  </MessageModelRoomSettingsField>
</template>
