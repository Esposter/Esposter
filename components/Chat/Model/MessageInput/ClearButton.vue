<script setup lang="ts">
import { useMessageInputStore } from "@/store/chat/useMessageInputStore";

const messageInputStore = useMessageInputStore();
const { updateMessageInput } = messageInputStore;
</script>

<template>
  <v-tooltip location="top" text="Clear">
    <template #activator="{ props }">
      <v-btn icon="mdi-close-circle" size="small" bg="transparent!" :="props" @click="updateMessageInput('')" />
    </template>
  </v-tooltip>
</template>
