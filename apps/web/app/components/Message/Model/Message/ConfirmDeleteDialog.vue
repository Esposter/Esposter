<script setup lang="ts">
import { getEntityIdEqualComparator } from "#src/services/entity/getEntityIdEqualComparator";
import { getMessageWriteTarget } from "#src/services/message/getMessageWriteTarget";
import { MessageComponentMap } from "#src/services/message/MessageComponentMap";
import { useDataStore } from "#src/store/message/data";
import { useMessageDialogStore } from "#src/store/message/dialog";
import { getResultAsync, noop } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { getSlice, storeCreateMessage, storeDeleteMessage } = dataStore;
const { items } = storeToRefs(dataStore);
const messageDialogStore = useMessageDialogStore();
const { deletingMessageId } = storeToRefs(messageDialogStore);
const { isOpen, item: message } = useSingletonDialog(deletingMessageId, () =>
  items.value.find(({ id }) => id === deletingMessageId.value),
);
const creator = useCreator(message);
const { executeMutation } = useMutation();
const deleteMessage = () => {
  const target = getMessageWriteTarget(message.value, getSlice);
  if (!target) return;
  const { messageId, roomId, roomItems } = target;
  executeMutation(() => $trpc.message.deleteMessage.mutate({ id: messageId, roomId }), {
    applyOptimistic: async () => {
      const deletedMessage = roomItems.value.find(getEntityIdEqualComparator(["id"], { id: messageId }));
      await storeDeleteMessage({ id: messageId, roomId });
      if (!deletedMessage) return noop;

      return () => {
        // Through storeCreateMessage so the Create hooks undo what the Delete hooks did (attachment urls, the
        // Reply index), and terminated here because nothing awaits a rollback
        getResultAsync(() => storeCreateMessage(deletedMessage)).match(noop, console.error);
      };
    },
    key: messageId,
  });
};
</script>

<template>
  <UiConfirmDialog
    v-if="message && creator"
    v-model="isOpen"
    confirm-label="Delete"
    title="Delete Message"
    :confirm="deleteMessage"
  >
    <p>Are you sure you want to delete this message?</p>
    <div py-2 ui-frame>
      <component :is="MessageComponentMap[message.type]" :creator :message is-preview />
    </div>
  </UiConfirmDialog>
</template>
