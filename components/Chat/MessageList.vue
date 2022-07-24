<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

const roomStore = useRoomStore();
const { messages } = storeToRefs(roomStore);
</script>

<template>
  <v-list flex="1 col-reverse" basis="full" display="flex" lines="two">
    <ChatMessageListItem v-for="message in messages" :key="message.id" :message="message" />
  </v-list>
</template>
