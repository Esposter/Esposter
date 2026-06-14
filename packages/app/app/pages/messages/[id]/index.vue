<script setup lang="ts">
import { validate } from "@/services/router/validate";

definePageMeta({ middleware: "auth", validate });

const route = useRoute();
const { $trpc } = useNuxtApp();
await $trpc.userToRoom.updateUserToRoom.mutate({ lastMessageAt: new Date(), roomId: route.params.id as string });
</script>

<template>
  <NuxtLayout name="messages" />
</template>
