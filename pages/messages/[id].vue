<script setup lang="ts">
import { useRoomStore } from "@/store/useRoomStore";

const route = useRoute();
const roomStore = useRoomStore();
roomStore.currentRoomId = typeof route.params.id === "string" ? route.params.id : null;
</script>

<template>
  <ChatWindow />
</template>
