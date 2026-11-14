<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { useAlertStore } from "@/store/alert";
import { useForwardStore } from "@/store/message/input/forward";
import { RoutePath, takeOne } from "@esposter/shared";

interface Props {
  forward: ClientMessage;
}

defineProps<Props>();
const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const forwardStore = useForwardStore();
const { resetForward } = forwardStore;
const { messageInput, roomIds } = storeToRefs(forwardStore);
const { executeMutation, isPending } = useMutation();
</script>

<!-- Forwarded messages land in the target rooms via the subscription echo — non-optimistic.
     The destination is captured before the reset, and the reset runs before navigating: after `navigateTo`
     the forward store's room-keyed `useDataMap` resolves against the destination room, so resetting
     afterwards would clear the destination's state instead of the source's -->
<template>
  <UiButton
    :disabled="roomIds.length === 0"
    :is-pending
    :variant="UiButtonVariant.Accent"
    @click="
      async () =>
        await executeMutation(
          () =>
            $trpc.message.forwardMessage.mutate({
              id: forward.id,
              message: messageInput,
              roomId: forward.roomId,
              roomIds,
            }),
          {
            key: forward.id,
            onSuccess: async () => {
              const destinationRoomId = roomIds.length === 1 ? takeOne(roomIds) : '';
              resetForward();
              if (destinationRoomId) {
                await navigateTo(RoutePath.Messages(destinationRoomId));
                createAlert('Message forwarded!', 'success', { icon: 'i-mdi:share' });
              }
            },
          },
        )
    "
  >
    Send{{ roomIds.length > 1 ? ` (${roomIds.length})` : "" }}
  </UiButton>
</template>
