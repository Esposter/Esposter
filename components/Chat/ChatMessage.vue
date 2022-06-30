<script setup lang="ts">
import type { ChatMessage } from "@/components/Chat/types";

interface ChatMessageProps {
  message: ChatMessage;
}

const { message } = defineProps<ChatMessageProps>();
</script>

<template>
  <v-list-item>{{ message.message }}</v-list-item>
</template>
