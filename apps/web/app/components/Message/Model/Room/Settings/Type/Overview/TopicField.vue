<script setup lang="ts">
const modelValue = defineModel<string>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <UiTextField
    v-model="modelValue"
    hint="Visible below the room name. Use /topic to update from chat."
    label="Topic"
    @focusout="emit('save')"
    @keydown.enter.prevent="emit('save')"
  />
</template>
