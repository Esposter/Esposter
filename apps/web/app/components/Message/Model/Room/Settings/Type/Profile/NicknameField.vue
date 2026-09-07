<script setup lang="ts">
import { NICKNAME_MAX_LENGTH } from "@esposter/db-schema";

const modelValue = defineModel<string>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <MessageModelRoomSettingsField
    hint="Overrides your global username within this room. Leave blank to use your global username."
    title="Nickname"
  >
    <v-text-field
      v-model="modelValue"
      density="compact"
      placeholder="Your display name in this room"
      :maxlength="NICKNAME_MAX_LENGTH"
      @blur="emit('save')"
      @keydown.enter.prevent="emit('save')"
    />
  </MessageModelRoomSettingsField>
</template>
