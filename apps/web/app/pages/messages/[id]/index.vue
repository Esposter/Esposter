<script setup lang="ts">
import { PageMarkType } from "#shared/models/app/PageMarkType";
import { checkIsUuidRouteId } from "@/services/router/checkIsUuidRouteId";

definePageMeta({ middleware: "auth", validate: checkIsUuidRouteId });

const route = useRoute();
const { $trpc } = useNuxtApp();
const roomId = route.params.id;
// The dock draws the room by its icon meaning, and a bookmark of the room goes with it when the room is deleted
usePageMark(() => ({ id: roomId, type: PageMarkType.Room }));
await Promise.all([
  $trpc.userToRoom.updateUserToRoom.mutate({ lastReadAt: new Date(), roomId }),
  $trpc.userToRoom.clearMentionCount.mutate({ roomId }),
]);
</script>

<template>
  <NuxtLayout name="messages" />
</template>
