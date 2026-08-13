<script setup lang="ts">
import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { getIsEntityIdEqualComparator } from "@/services/entity/getIsEntityIdEqualComparator";
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useDataStore } from "@/store/message/data";
import { useMessageDialogStore } from "@/store/message/dialog";
import { getResultAsync, noop } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { storeCreateMessage, storeDeleteMessage } = dataStore;
const { items } = storeToRefs(dataStore);
const messageDialogStore = useMessageDialogStore();
const { deletingRowKey } = storeToRefs(messageDialogStore);
// Resolved through the primitive rather than a computed of our own, so a target whose message has left the
// Timeline is dropped with it instead of re-opening this dialog by itself when a later read brings it back
const { isOpen, item: message } = useSingletonDialog(deletingRowKey, () =>
  items.value.find(({ rowKey }) => rowKey === deletingRowKey.value),
);
const creator = useCreator(message);
const { executeMutation } = useMutation();
const deleteMessage = async (onComplete: () => void) => {
  if (!message.value) return;
  const { partitionKey, rowKey } = message.value;
  onComplete();
  await executeMutation(() => $trpc.message.deleteMessage.mutate({ partitionKey, rowKey }), {
    // Resolved as the write is sent rather than at the click — the dialog has already closed and cleared its
    // Target by then, so the row is read off the timeline instead of the dialog's own item
    applyOptimistic: async () => {
      const deletedMessage = items.value.find(
        getIsEntityIdEqualComparator(CompositeAzureKeyPath, { partitionKey, rowKey }),
      );
      await storeDeleteMessage({ partitionKey, rowKey });
      if (!deletedMessage) return noop;

      return () => {
        // The one row this write removed, not a copy of the timeline: reinstating that would resurrect a message
        // A concurrent delete already took out and drop whatever a subscription delivered mid-flight. It lands at
        // The head of the timeline rather than where it stood — a cosmetic loss, taken over dropping a row.
        // Through storeCreateMessage so the Create hooks undo what the Delete hooks did (attachment urls, the
        // Reply index), and terminated here because nothing awaits a rollback
        getResultAsync(() => storeCreateMessage(deletedMessage)).match(noop, console.error);
      };
    },
    key: rowKey,
  });
};
</script>

<template>
  <StyledDeleteFormDialog
    v-if="message && creator"
    v-model="isOpen"
    :card-props="{ title: 'Delete Message' }"
    @delete="deleteMessage"
  >
    Are you sure you want to delete this message?
    <StyledPreviewCard>
      <component :is="MessageComponentMap[message.type]" :creator :message is-preview />
    </StyledPreviewCard>
  </StyledDeleteFormDialog>
</template>
