<script setup lang="ts">
import type { ClientMessage } from "#src/models/message/ClientMessage";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useAlertStore } from "#src/store/alert";
import { useForwardStore } from "#src/store/message/input/forward";
import { getSynchronizedFunction, noop, RoutePath, takeOne } from "@esposter/shared";

interface Props {
  forward: ClientMessage;
}

const { forward } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const forwardStore = useForwardStore();
const { resetForward } = forwardStore;
const { messageInput, roomIds } = storeToRefs(forwardStore);
const { executeMutation, isPending } = useMutation();
const navigateToDestination = getSynchronizedFunction(async (roomId: string) => {
  await navigateTo(RoutePath.Messages(roomId));
});
// The forward is sent and the panel resets at once. What it carries is taken before the reset empties the panel, and the
// Navigation runs after the reset: once the route moves, the forward store's room-keyed data resolves against the
// Destination room, so resetting afterwards would clear the destination's state instead of the source's
const sendForward = () => {
  const destinationRoomId = roomIds.value.length === 1 ? takeOne(roomIds.value) : "";
  const message = messageInput.value;
  const forwardedRoomIds = roomIds.value;
  resetForward();
  if (destinationRoomId) navigateToDestination(destinationRoomId);
  executeMutation(
    () =>
      $trpc.message.forwardMessage.mutate({
        id: forward.id,
        message,
        roomId: forward.roomId,
        roomIds: forwardedRoomIds,
      }),
    {
      applyOptimistic: () => noop,
      key: forward.id,
      // The confirmation waits for the server, since a refused forward has nothing to confirm
      reconcile: () => {
        if (destinationRoomId) createAlert("Message forwarded!", "success", { icon: "i-mdi:share" });
      },
    },
  );
};
</script>

<!-- The panel resets and a single destination opens as the forward is sent, and only its confirmation waits for the server -->
<template>
  <UiButton :disabled="roomIds.length === 0" :is-pending :variant="UiButtonVariant.Accent" @click="sendForward()">
    Send{{ roomIds.length > 1 ? ` (${roomIds.length})` : "" }}
  </UiButton>
</template>
