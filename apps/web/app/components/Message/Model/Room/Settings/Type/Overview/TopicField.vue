<script setup lang="ts">
const modelValue = defineModel<string>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <MessageModelRoomSettingsField hint="Visible below the room name. Use /topic to update from chat.">
    <UiTextField v-model="modelValue" label="Topic" @focusout="emit('save')" @keydown.enter.prevent="emit('save')" />
  </MessageModelRoomSettingsField>
</template>
