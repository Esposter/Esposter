<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const roomStore = useRoomStore();
const { messages } = storeToRefs(roomStore);
</script>

<template>
  <v-list display="flex" flex="1 col-reverse" basis="full" lines="two">
    <ChatMessageListItem v-for="message in messages" :key="message.rowKey" :message="message" />
  </v-list>
</template>
