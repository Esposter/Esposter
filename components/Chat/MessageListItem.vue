<script setup lang="ts">
import type { Message } from "@/server/trpc/room";
import { useRoomStore } from "@/store/useRoomStore";

interface ChatMessageProps {
  message: Message;
}

const { message } = defineProps<ChatMessageProps>();
const { members } = useRoomStore();
const member = members.find((m) => m.id === message.userId);
const isMessageActive = ref(false);
const isOptionsActive = ref(false);
const active = computed(() => isMessageActive.value || isOptionsActive.value);
</script>

<template>
  <v-list-item
    v-if="member"
    :active="active"
    @mouseenter="isMessageActive = true"
    @mouseleave="isMessageActive = false"
  >
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
  <div position="relative" z="1">
    <div
      v-show="active"
      position="absolute"
      top="-6"
      right="0"
      @mouseenter="isOptionsActive = true"
      @mouseleave="isOptionsActive = false"
    >
      <v-hover #default="{ isHovering, props }">
        <ChatMessageOptionsMenu :isHovering="isHovering" :hoverProps="props" />
      </v-hover>
    </div>
  </div>
</template>
