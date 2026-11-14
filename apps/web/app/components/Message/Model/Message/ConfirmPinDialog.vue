<script setup lang="ts">
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useDataStore } from "@/store/message/data";
import { useMessageDialogStore } from "@/store/message/dialog";
import { noop } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { getSlice } = dataStore;
const { items } = storeToRefs(dataStore);
const messageDialogStore = useMessageDialogStore();
const { pinningMessageId } = storeToRefs(messageDialogStore);
const { isOpen, item: message } = useSingletonDialog(pinningMessageId, () =>
  items.value.find(({ id }) => String(id) === pinningMessageId.value),
);
const creator = useCreator(message);
const { executeMutation } = useMutation();
const pinMessage = async () => {
  if (!message.value) return;
  const { id: messageId, roomId } = message.value;
  // Resolved as the pin is issued: the optimistic apply runs when the write is sent, by which time the room on
  // Screen can be another one
  const { items: roomItems } = getSlice(roomId);
  await executeMutation(() => $trpc.message.pinMessage.mutate({ id: messageId, roomId }), {
    applyOptimistic: () => {
      const pinnedMessage = roomItems.value.find(getEntityIdEqualComparator(["id"], { id: messageId }));
      if (!pinnedMessage) return noop;
      // Read as the write is sent rather than assumed: an unpin that landed — or was itself rolled back — between
      // The click and this write decides what pinning owes back, and a hard-coded unpin would drop a pin the server
      // Still has pinned
      const previousIsPinned = pinnedMessage.isPinned;
      pinnedMessage.isPinned = true;
      return () => {
        pinnedMessage.isPinned = previousIsPinned;
      };
    },
    key: messageId,
  });
};
</script>

<template>
  <StyledDialog
    v-if="message && creator"
    v-model="isOpen"
    confirm-label="Oh yeah. Pin it"
    :confirm="pinMessage"
    is-optimistic
    title="Pin It. Pin It Good."
  >
    <p>Hey, just double-checking that you want to pin this message to the current room for posterity and greatness?</p>
    <div py-2 ui-frame>
      <component :is="MessageComponentMap[message.type]" :creator :message is-preview />
    </div>
  </StyledDialog>
</template>
