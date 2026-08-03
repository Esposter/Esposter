<script setup lang="ts">
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useDataStore } from "@/store/message/data";
import { useMessageDialogStore } from "@/store/message/dialog";

const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { storeDeleteMessage } = dataStore;
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
  const snapshot = [...items.value];
  onComplete();
  await executeMutation(() => $trpc.message.deleteMessage.mutate({ partitionKey, rowKey }), {
    applyOptimistic: async () => {
      await storeDeleteMessage({ partitionKey, rowKey });
      return () => {
        items.value = snapshot;
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
