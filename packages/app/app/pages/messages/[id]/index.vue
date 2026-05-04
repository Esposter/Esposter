<script setup lang="ts">
import { validate } from "@/services/router/validate";
import { useUserToRoomStore } from "@/store/message/room/userToRoom";

definePageMeta({ middleware: "auth", validate });

const route = useRoute();
const { updateUserToRoom } = useUserToRoomStore();
await updateUserToRoom({ lastMessageAt: new Date(), roomId: route.params.id as string });
</script>

<template>
  <NuxtLayout name="messages" />
</template>
