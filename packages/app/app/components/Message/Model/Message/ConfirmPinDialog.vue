<script setup lang="ts">
import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useDataStore } from "@/store/message/data";
import { useMessageDialogStore } from "@/store/message/dialog";
import { noop } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const messageDialogStore = useMessageDialogStore();
const { pinningRowKey } = storeToRefs(messageDialogStore);
const { isOpen, item: message } = useSingletonDialog(pinningRowKey, () =>
  items.value.find(({ rowKey }) => rowKey === pinningRowKey.value),
);
const creator = useCreator(message);
const { executeMutation } = useMutation();
const pinMessage = async (onComplete: () => void) => {
  if (!message.value) return;
  const { partitionKey, rowKey } = message.value;
  onComplete();
  await executeMutation(() => $trpc.message.pinMessage.mutate({ partitionKey, rowKey }), {
    applyOptimistic: () => {
      const pinnedMessage = items.value.find(
        getEntityIdEqualComparator(CompositeAzureKeyPath, { partitionKey, rowKey }),
      );
      if (!pinnedMessage) return noop;
      // Read as the write is sent rather than assumed: an unpin that landed — or was itself rolled back — between
      // The click and this write decides what pinning owes back, and a hard-coded delete would unpin a message
      // The server still has pinned
      const previousIsPinned = pinnedMessage.isPinned;
      pinnedMessage.isPinned = true;
      return () => {
        if (previousIsPinned) pinnedMessage.isPinned = previousIsPinned;
        else delete pinnedMessage.isPinned;
      };
    },
    key: rowKey,
  });
};
</script>

<template>
  <StyledDialog
    v-if="message && creator"
    v-model="isOpen"
    :card-props="{ title: 'Pin It. Pin It Good.' }"
    :confirm-button-props="{ text: 'Oh yeah. Pin it' }"
    @confirm="pinMessage"
  >
    Hey, just double-checking that you want to pin this message to the current room for posterity and greatness?
    <StyledPreviewCard>
      <component :is="MessageComponentMap[message.type]" :creator :message is-preview />
    </StyledPreviewCard>
  </StyledDialog>
</template>
