<script setup lang="ts">
import type { Message } from "@/server/trpc/room";
import { useRoomStore } from "@/store/useRoomStore";

interface ChatMessageProps {
  message: Message;
}

const { message } = defineProps<ChatMessageProps>();
const { members } = useRoomStore();
const member = members.find((m) => m.id === message.userId);
</script>

<template>
  <v-list-item v-if="member">
    <template #prepend>
      <v-list-item-avatar class="mt-1 mr-4">
        <v-img :src="member.avatar" :alt="member.username" />
      </v-list-item-avatar>
    </template>
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
