<script setup lang="ts">
import type { ClientMessage } from "#src/models/message/ClientMessage";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiToken } from "#src/models/ui/UiToken";
import { useAlertStore } from "#src/store/alert";
import { useForwardStore } from "#src/store/message/input/forward";
import { useRoomStore } from "#src/store/message/room/index";
import { getSynchronizedFunction, RoutePath, takeOne } from "@esposter/shared";

interface Props {
  forward: ClientMessage;
}

const { forward } = defineProps<Props>();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const forwardStore = useForwardStore();
const { sendForward } = forwardStore;
const { isForwardPending, messageInput, roomIds } = storeToRefs(forwardStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const navigateToDestination = getSynchronizedFunction(async (roomId: string) => {
  await navigateTo(RoutePath.Messages(roomId));
});
// The panel keeps the forward while the server has it. An answered forward empties the panel of the room it was
// Composed in, then opens the single destination; a refused one leaves the draft where it was, under the alert
const send = async () => {
  const destinationRoomId = roomIds.value.length === 1 ? takeOne(roomIds.value) : "";
  const isSent = await sendForward(currentRoomId.value, forward, {
    message: messageInput.value,
    roomIds: [...roomIds.value],
  });
  if (!isSent || !destinationRoomId) return;

  createAlert("Message forwarded!", UiToken.Success, { icon: "i-mdi:share" });
  navigateToDestination(destinationRoomId);
};
</script>

<!-- The panel empties and a single destination opens once the server has the forward, so a refused forward keeps
  its draft -->
<template>
  <UiButton
    :disabled="roomIds.length === 0"
    :is-pending="isForwardPending"
    :variant="UiButtonVariant.Accent"
    @click="send()"
  >
    Send{{ roomIds.length > 1 ? ` (${roomIds.length})` : "" }}
  </UiButton>
</template>
