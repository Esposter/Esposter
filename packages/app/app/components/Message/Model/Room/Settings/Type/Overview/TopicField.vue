<script setup lang="ts">
const modelValue = defineModel<string>({ required: true });
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <div flex flex-col gap-2>
    <div font-semibold>Topic</div>
    <v-text-field
      v-model="modelValue"
      density="compact"
      hide-details="auto"
      placeholder="Set a topic for this room"
      @blur="emit('save')"
      @keydown.enter.prevent="emit('save')"
    />
    <span text-medium-emphasis text-xs>Visible below the room name. Use /topic to update from chat.</span>
  </div>
</template>
