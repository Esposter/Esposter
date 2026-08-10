<script setup lang="ts">
import { dayjs } from "#shared/services/dayjs";

const modelValue = defineModel<null | number>({ required: true });
const emit = defineEmits<{ save: [] }>();
const rules = useVRules();
</script>

<template>
  <MessageModelRoomSettingsField hint="Seconds between messages. Leave empty to disable." title="Slowmode">
    <v-text-field
      :model-value="modelValue != null ? dayjs.duration(modelValue).asSeconds() : ''"
      :rules="[rules.minValue(1)]"
      density="compact"
      hide-details="auto"
      placeholder="Disabled"
      type="number"
      min="1"
      @update:model-value="
        modelValue = $event && Number($event) >= 1 ? dayjs.duration(Number($event), 'seconds').asMilliseconds() : null
      "
      @blur="emit('save')"
      @keydown.enter.prevent="emit('save')"
    />
  </MessageModelRoomSettingsField>
</template>
