<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const { messages } = useRoomStore();
</script>

<template>
  <v-list class="flex-1 basis-full flex flex-col-reverse overflow-y-auto" lines="two">
    <ChatMessage v-for="message in messages" :key="message.id" :message="message" />
  </v-list>
</template>
