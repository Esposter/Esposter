<script setup lang="ts">
const modelValue = defineModel<boolean>();
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <div flex flex-col gap-2>
    <div font-semibold>Read-only</div>
    <v-switch v-model="modelValue" color="primary" hide-details @update:model-value="emit('save')" />
    <span op-medium-emphasis text-body-small>Only members with Manage Messages permission can post.</span>
  </div>
</template>
