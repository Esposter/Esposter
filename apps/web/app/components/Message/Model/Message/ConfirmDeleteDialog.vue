<script setup lang="ts">
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { getMessageWriteTarget } from "#src/services/message/getMessageWriteTarget";
import { MessageComponentMap } from "#src/services/message/MessageComponentMap";
import { useDataStore } from "#src/store/message/data";
import { useMessageDialogStore } from "#src/store/message/dialog";

const dataStore = useDataStore();
const { deleteMessage, getSlice } = dataStore;
const { items } = storeToRefs(dataStore);
const messageDialogStore = useMessageDialogStore();
const { deletingMessageId } = storeToRefs(messageDialogStore);
const { isOpen, item: message } = useSingletonDialog(deletingMessageId, () =>
  items.value.find(({ id }) => id === deletingMessageId.value),
);
const creator = useCreator(message);
</script>

<template>
  <UiConfirmDialog
    v-if="message && creator"
    v-model="isOpen"
    :awaited-because="AwaitedReason.ServerDecidedOutcome"
    :confirm="
      () => {
        const target = getMessageWriteTarget(message, getSlice);
        if (!target) return;

        return deleteMessage({ id: target.messageId, roomId: target.roomId });
      }
    "
    confirm-label="Delete"
    title="Delete Message"
  >
    <!-- The message leaves the list once the room answers the removal. A refused removal leaves it where it was,
    Under the alert -->
    <p>Are you sure you want to delete this message?</p>
    <div py-2 ui-frame>
      <component :is="MessageComponentMap[message.type]" :creator :message is-preview />
    </div>
  </UiConfirmDialog>
</template>
