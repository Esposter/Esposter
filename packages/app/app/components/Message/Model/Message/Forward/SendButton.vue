<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { useAlertStore } from "@/store/alert";
import { useForwardStore } from "@/store/message/input/forward";
import { RoutePath, takeOne } from "@esposter/shared";

interface Props {
  forward: MessageEntity;
}

const { forward } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const forwardStore = useForwardStore();
const { resetForward } = forwardStore;
const { messageInput, roomIds } = storeToRefs(forwardStore);
const { executeMutation } = useMutation();
</script>

<!-- Forwarded messages land in the target rooms via the subscription echo — non-optimistic.
     The destination is captured before the reset, and the reset runs before navigating: after `navigateTo`
     the forward store's room-keyed `useDataMap` resolves against the destination room, so resetting
     afterwards would clear the destination's state instead of the source's -->
<template>
  <StyledButton
    w-full
    :button-props="{
      disabled: roomIds.length === 0,
      text: `Send ${roomIds.length > 1 ? `(${roomIds.length})` : ''}`,
    }"
    @click="
      async () =>
        await executeMutation(
          () =>
            $trpc.message.forwardMessage.mutate({
              message: messageInput,
              partitionKey: forward.partitionKey,
              roomIds,
              rowKey: forward.rowKey,
            }),
          {
            key: forward.rowKey,
            onSuccess: async () => {
              const destinationRoomId = roomIds.length === 1 ? takeOne(roomIds) : '';
              resetForward();
              if (destinationRoomId) {
                await navigateTo(RoutePath.Messages(destinationRoomId));
                createAlert('Message forwarded!', 'success', { icon: 'mdi-share', location: 'top center' });
              }
            },
          },
        )
    "
  />
</template>
