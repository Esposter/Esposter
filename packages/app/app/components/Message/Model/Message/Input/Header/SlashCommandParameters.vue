<script setup lang="ts">
import { useSlashCommandStore } from "@/store/message/input/slashCommand";

const slashCommandStore = useSlashCommandStore();
const { activeParameterNames, errors, focusedIndex, pendingSlashCommand } = storeToRefs(slashCommandStore);
const { clearPendingSlashCommand } = slashCommandStore;
const activeParameters = computed(
  () => pendingSlashCommand.value?.parameters.filter(({ name }) => activeParameterNames.value.includes(name)) ?? [],
);
const focusedParameter = computed(() => activeParameters.value[focusedIndex.value]);
const firstError = computed(() => errors.value[0]?.messages[0]);
</script>

<template>
  <MessageModelMessageInputHeader v-if="pendingSlashCommand" @close="clearPendingSlashCommand()">
    <template v-if="focusedParameter">
      <span font-bold>{{ focusedParameter.name }}</span>
      <span v-if="firstError" class="text-error">{{ firstError }}</span>
      <span v-else opacity-60>Your {{ focusedParameter.name }}</span>
    </template>
    <template v-else>
      <span font-bold>/{{ pendingSlashCommand.title }}</span>
      <span opacity-60>{{ pendingSlashCommand.description }}</span>
    </template>
  </MessageModelMessageInputHeader>
</template>
