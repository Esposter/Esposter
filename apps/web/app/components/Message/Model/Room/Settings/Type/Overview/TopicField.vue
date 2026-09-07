<script setup lang="ts">
const modelValue = defineModel<string>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <MessageModelRoomSettingsField hint="Visible below the room name. Use /topic to update from chat." title="Topic">
    <v-text-field
      v-model="modelValue"
      density="compact"
      placeholder="Set a topic for this room"
      @blur="emit('save')"
      @keydown.enter.prevent="emit('save')"
    />
  </MessageModelRoomSettingsField>
</template>
