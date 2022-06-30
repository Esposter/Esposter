<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const roomStore = useRoomStore();
</script>

<template>
  <div class="flex flex-col h-100">
    <ChatContentHeader />
    <v-container class="flex-1 flex flex-col" fluid>
      <v-row class="flex-1 flex flex-col">
        <v-col class="flex-1 flex flex-col-reverse overflow-y-auto">
          <ChatMessage v-for="message in roomStore.messages" :key="message.id" :message="message" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
