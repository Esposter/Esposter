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
const message = computed(() => items.value.find(({ rowKey }) => rowKey === deletingRowKey.value));
const creator = useCreator(message);
const isOpen = useSingletonDialog(deletingRowKey);
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
