<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const roomStore = useRoomStore();
</script>

<template>
  <v-list class="flex-1 flex flex-col-reverse overflow-y-auto" lines="two">
    <ChatMessage v-for="message in roomStore.messages" :key="message.id" :message="message" />
  </v-list>
</template>
