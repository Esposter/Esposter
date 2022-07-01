<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";
import ChatMessageList from "./ChatMessageList.vue";

const roomStore = useRoomStore();
</script>

<template>
  <div class="flex flex-col h-100">
    <ChatContentHeader />
    <ChatMessageList />
  </div>
</template>
