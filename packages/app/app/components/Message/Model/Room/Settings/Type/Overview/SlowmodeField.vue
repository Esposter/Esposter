<script setup lang="ts">
const modelValue = defineModel<null | number>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <div flex flex-col gap-2>
    <div font-semibold>Slowmode</div>
    <v-text-field
      :model-value="modelValue ?? ''"
      density="compact"
      hide-details="auto"
      placeholder="Disabled"
      type="number"
      min="0"
      @update:model-value="modelValue = $event ? Number($event) : null"
      @blur="emit('save')"
      @keydown.enter.prevent="emit('save')"
    />
    <span class="text-medium-emphasis" text-xs>Milliseconds between messages. Leave empty to disable.</span>
  </div>
</template>
