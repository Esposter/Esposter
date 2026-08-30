<script setup lang="ts">
import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";
import { requireRouteParam } from "@/util/router/requireRouteParam";

definePageMeta({ middleware: "auth", validate: checkIsUuidRouteId });

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
