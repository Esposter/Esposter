<script setup lang="ts">
import { validate } from "@/services/router/validate";

definePageMeta({ middleware: "auth", validate });

const route = useRoute();
const { $trpc } = useNuxtApp();
const roomId = route.params.id as string;
await Promise.all([
  $trpc.userToRoom.updateUserToRoom.mutate({ lastMessageAt: new Date(), roomId }),
  $trpc.userToRoom.clearMentionCount.mutate({ roomId }),
]);
</script>

<template>
  <NuxtLayout name="messages" />
</template>
