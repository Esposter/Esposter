<script setup lang="ts">
import { useSlashCommandStore } from "@/store/message/input/slashCommand";

const slashCommandStore = useSlashCommandStore();
const { pendingSlashCommand } = storeToRefs(slashCommandStore);
const { clearPendingSlashCommand } = slashCommandStore;
</script>

<template>
  <MessageModelMessageInputHeader v-if="pendingSlashCommand" @close="clearPendingSlashCommand()">
    <span font-bold>/{{ pendingSlashCommand.title }}</span>
    <span opacity-60 ml-1>{{ pendingSlashCommand.description }}</span>
  </MessageModelMessageInputHeader>
</template>
