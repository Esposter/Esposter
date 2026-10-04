<script setup lang="ts">
import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";

definePageMeta({ middleware: "auth", validate: checkIsUuidRouteId });

const route = useRoute();
const { $trpc } = useNuxtApp();
const roomId = route.params.id;
await Promise.all([
  $trpc.userToRoom.updateUserToRoom.mutate({ lastReadAt: new Date(), roomId }),
  $trpc.userToRoom.clearMentionCount.mutate({ roomId }),
]);
</script>

<template>
  <NuxtLayout name="messages" />
</template>
