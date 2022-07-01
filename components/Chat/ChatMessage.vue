<script setup lang="ts">
import type { ChatMessage } from "@/components/Chat/types";
import { useRoomStore } from "@/store/useRoomStore";

interface ChatMessageProps {
  message: ChatMessage;
}

const { message } = defineProps<ChatMessageProps>();
const roomStore = useRoomStore();
const member = roomStore.members.find((m) => m.id === message.userId);
</script>

<template>
  <v-list-item v-if="member" :prepend-avatar="member.avatar">
    <v-list-item-header>
      <v-list-item-title class="font-bold!">
        {{ member.username }}
      </v-list-item-title>
      <v-list-item-subtitle class="op-100!">
        {{ message.message }}
      </v-list-item-subtitle>
    </v-list-item-header>
  </v-list-item>
</template>
