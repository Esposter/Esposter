<script setup lang="ts">
import { formRules } from "@/services/vuetify/formRules";

const modelValue = defineModel<null | number>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <div flex flex-col gap-2>
    <div font-semibold>Slowmode</div>
    <v-text-field
      :model-value="modelValue != null ? modelValue / 1000 : ''"
      :rules="[formRules.requireAtLeastN(1)]"
      density="compact"
      hide-details="auto"
      placeholder="Disabled"
      type="number"
      min="1"
      @update:model-value="modelValue = $event && Number($event) >= 1 ? Number($event) * 1000 : null"
      @blur="emit('save')"
      @keydown.enter.prevent="emit('save')"
    />
    <span text-xs text-medium-emphasis>Seconds between messages. Leave empty to disable.</span>
  </div>
</template>
