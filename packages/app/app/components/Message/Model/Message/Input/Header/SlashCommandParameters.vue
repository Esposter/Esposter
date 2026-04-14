<script setup lang="ts">
import { useSlashCommandStore } from "@/store/message/input/slashCommand";

const slashCommandStore = useSlashCommandStore();
const { errors, pendingSlashCommand } = storeToRefs(slashCommandStore);
const { clearPendingSlashCommand } = slashCommandStore;
const firstError = computed(() => errors.value[0]?.messages[0]);
</script>

<template>
  <MessageModelMessageInputHeader v-if="pendingSlashCommand" @close="clearPendingSlashCommand()">
    <span font-bold>/{{ pendingSlashCommand.title }}</span>
    <span v-if="firstError" class="text-error" ml-1>{{ firstError }}</span>
    <span v-else opacity-60 ml-1>{{ pendingSlashCommand.description }}</span>
  </MessageModelMessageInputHeader>
</template>
