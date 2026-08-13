<script setup lang="ts">
import { validate } from "@/services/router/validate";
import { requireRouteParam } from "@/util/router/requireRouteParam";

definePageMeta({ middleware: "auth", validate });

const { currentRoute } = useRouter();
const { $trpc } = useNuxtApp();
const roomId = requireRouteParam(currentRoute.value.params, "id");
await Promise.all([
  $trpc.userToRoom.updateUserToRoom.mutate({ lastMessageAt: new Date(), roomId }),
  $trpc.userToRoom.clearMentionCount.mutate({ roomId }),
]);
</script>

<template>
  <NuxtLayout name="messages" />
</template>
