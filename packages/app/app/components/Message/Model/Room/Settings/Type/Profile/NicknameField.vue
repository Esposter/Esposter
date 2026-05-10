<script setup lang="ts">
import { NICKNAME_MAX_LENGTH } from "@esposter/db-schema";

const modelValue = defineModel<string>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <div flex flex-col gap-2>
    <div font-semibold>Nickname</div>
    <v-text-field
      v-model="modelValue"
      density="compact"
      hide-details
      placeholder="Your display name in this room"
      :maxlength="NICKNAME_MAX_LENGTH"
      @blur="emit('save')"
      @keydown.enter.prevent="emit('save')"
    />
    <span text-xs text-medium-emphasis>
      Overrides your global username within this room. Leave blank to use your global username.
    </span>
  </div>
</template>
