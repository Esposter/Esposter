<script setup lang="ts">
import type { ClientMessage } from "#src/models/message/ClientMessage";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { useAlertStore } from "#src/store/alert";
import { useForwardStore } from "#src/store/message/input/forward";
import { getSynchronizedFunction, RoutePath, takeOne } from "@esposter/shared";

interface Props {
  forward: ClientMessage;
}

const { forward } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const forwardStore = useForwardStore();
const { takeForward } = forwardStore;
const { messageInput, roomIds } = storeToRefs(forwardStore);
const { executeMutation, isPending } = useMutation();
const navigateToDestination = getSynchronizedFunction(async (roomId: string) => {
  await navigateTo(RoutePath.Messages(roomId));
});
// The forward is sent and the panel empties at once. What it carries is taken before the panel empties, and the
// Navigation runs after: the panel's draft is filed under the room it was composed in, so a refused forward puts it back there
const sendForward = () => {
  const destinationRoomId = roomIds.value.length === 1 ? takeOne(roomIds.value) : "";
  const message = messageInput.value;
  const forwardedRoomIds = roomIds.value;
  const restoreForward = takeForward();
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
      // The panel is already empty, so the rollback is the only step here: a refused forward restores the draft
      applyOptimistic: () => restoreForward,
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
