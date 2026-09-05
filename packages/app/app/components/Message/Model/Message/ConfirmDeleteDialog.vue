<script setup lang="ts">
import { CompositeAzureKeyPath } from "@/models/cache/indexedDb/keyPaths/CompositeAzureKeyPath";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
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
    applyOptimistic: async () => {
      const deletedMessage = items.value.find(
        getEntityIdEqualComparator(CompositeAzureKeyPath, { partitionKey, rowKey }),
      );
      await storeDeleteMessage({ partitionKey, rowKey });
      if (!deletedMessage) return noop;

      return () => {
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
