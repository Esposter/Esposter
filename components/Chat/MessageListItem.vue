<script setup lang="ts">
import type { Message } from "@/server/trpc/room";
import { useRoomStore } from "@/store/useRoomStore";

interface ChatMessageProps {
  message: Message;
}

const { message } = defineProps<ChatMessageProps>();
const { members } = useRoomStore();
const member = members.find((m) => m.id === message.userId);
const active = ref(false);
</script>

<template>
  <v-list-item v-if="member" :active="active" @mouseenter="active = true" @mouseleave="active = false">
    <template #prepend>
      <v-list-item-avatar start>
        <v-img :src="member.avatar" :alt="member.username" />
      </v-list-item-avatar>
    </template>
    <v-list-item-header>
      <v-list-item-title font="bold!">
        {{ member.username }}
      </v-list-item-title>
      <v-list-item-subtitle op="100!">
        {{ message.message }}
      </v-list-item-subtitle>
    </v-list-item-header>
  </v-list-item>
</template>
