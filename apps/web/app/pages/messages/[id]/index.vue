<script setup lang="ts">
import { PageMarkType } from "#shared/models/app/PageMarkType";
import { checkIsUuidRouteId } from "#src/services/router/checkIsUuidRouteId";
import { noop } from "@esposter/shared";

definePageMeta({ middleware: "auth", validate: checkIsUuidRouteId });

const route = useRoute();
const { $trpc } = useNuxtApp();
const roomId = route.params.id;
// The dock draws the room by its icon meaning, and a bookmark of the room goes with it when the room is deleted
usePageMark(() => ({ id: roomId, type: PageMarkType.Room }));
// Marking the room read is a write nothing on the page waits for, so it is sent without holding up the render
const { executeMutation } = useMutation();
executeMutation(
  () =>
    Promise.all([
      $trpc.userToRoom.updateUserToRoom.mutate({ lastReadAt: new Date(), roomId }),
      $trpc.userToRoom.clearMentionCount.mutate({ roomId }),
    ]),
  { applyOptimistic: () => noop, key: roomId },
);
</script>

<template>
  <NuxtLayout name="messages" />
</template>
