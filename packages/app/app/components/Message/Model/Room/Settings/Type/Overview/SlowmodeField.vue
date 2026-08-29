<script setup lang="ts">
import { SECOND } from "@esposter/shared";

const modelValue = defineModel<null | number>({ required: true });
const emit = defineEmits<{ save: [] }>();
const rules = useVRules();
const slowmodeRules = computed(() => [rules.minValue(1)]);
</script>

<template>
  <MessageModelRoomSettingsField hint="Seconds between messages. Leave empty to disable." title="Slowmode">
    <v-text-field
      :model-value="modelValue != null ? modelValue / SECOND : ''"
      :rules="slowmodeRules"
      density="compact"
      placeholder="Disabled"
      type="number"
      min="1"
      @update:model-value="modelValue = $event && Number($event) >= 1 ? Number($event) * SECOND : null"
      @blur="emit('save')"
      @keydown.enter.prevent="emit('save')"
    />
  </MessageModelRoomSettingsField>
</template>
