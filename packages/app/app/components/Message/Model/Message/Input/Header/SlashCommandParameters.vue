<script setup lang="ts">
import { useSlashCommandStore } from "@/store/message/input/slashCommand";

const slashCommandStore = useSlashCommandStore();
const { isSubmitAttempted, parameterValues, pendingSlashCommand } = storeToRefs(slashCommandStore);
const { clearPendingSlashCommand } = slashCommandStore;
const firstError = computed(() => {
  if (!isSubmitAttempted.value || !pendingSlashCommand.value) return null;
  const parameter = pendingSlashCommand.value.parameters.find(
    ({ isRequired, name }) => isRequired && !parameterValues.value[name]?.trim(),
  );
  return parameter ? `${parameter.name} is required` : null;
});
</script>

<template>
  <MessageModelMessageInputHeader v-if="pendingSlashCommand" @close="clearPendingSlashCommand()">
    <span font-bold>/{{ pendingSlashCommand.title }}</span>
    <span v-if="firstError" class="text-error" ml-1>{{ firstError }}</span>
    <span v-else opacity-60 ml-1>{{ pendingSlashCommand.description }}</span>
  </MessageModelMessageInputHeader>
</template>
