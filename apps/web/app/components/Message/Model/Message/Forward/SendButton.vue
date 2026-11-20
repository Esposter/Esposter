<script setup lang="ts">
import type { ClientMessage } from "#src/models/message/ClientMessage";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useAlertStore } from "#src/store/alert";
import { useForwardStore } from "#src/store/message/input/forward";
import { useRoomStore } from "#src/store/message/room/index";
import { getResultAsync, getSynchronizedFunction, RoutePath, takeOne, withFinalizerAsync } from "@esposter/shared";

interface Props {
  forward: ClientMessage;
}

const { forward } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const forwardStore = useForwardStore();
const { clearForward } = forwardStore;
const { messageInput, roomIds } = storeToRefs(forwardStore);
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
const isPending = ref(false);
const navigateToDestination = getSynchronizedFunction(async (roomId: string) => {
  await navigateTo(RoutePath.Messages(roomId));
});
// The panel keeps the forward while the server has it. An answered forward empties the panel of the room it was composed
// In, then opens the single destination; a refused one leaves the draft where it was, under the alert
const sendForward = async () => {
  if (isPending.value) return;

  const sentRoomId = currentRoomId.value;
  const destinationRoomId = roomIds.value.length === 1 ? takeOne(roomIds.value) : "";
  const message = messageInput.value;
  const forwardedRoomIds = roomIds.value;
  isPending.value = true;
  await withFinalizerAsync(
    () =>
      getResultAsync(() =>
        $trpc.message.forwardMessage.mutate({
          id: forward.id,
          message,
          roomId: forward.roomId,
          roomIds: forwardedRoomIds,
        }),
      ).match(() => {
        clearForward(sentRoomId);
        if (!destinationRoomId) return;

        createAlert("Message forwarded!", "success", { icon: "i-mdi:share" });
        navigateToDestination(destinationRoomId);
      }, createErrorAlert),
    () => {
      isPending.value = false;
    },
  );
};
</script>

<!-- The panel empties and a single destination opens once the server has the forward, so a refused forward keeps its draft -->
<template>
  <UiButton :disabled="roomIds.length === 0" :is-pending :variant="UiButtonVariant.Accent" @click="sendForward()">
    Send{{ roomIds.length > 1 ? ` (${roomIds.length})` : "" }}
  </UiButton>
</template>
