<script setup lang="ts">
import { AwaitedReason } from "#src/models/shared/AwaitedReason";
import { getMessageWriteTarget } from "#src/services/message/getMessageWriteTarget";
import { MessageComponentMap } from "#src/services/message/MessageComponentMap";
import { useDataStore } from "#src/store/message/data";
import { useMessageDialogStore } from "#src/store/message/dialog";

const dataStore = useDataStore();
const { getSlice, pinMessage } = dataStore;
const { items } = storeToRefs(dataStore);
const messageDialogStore = useMessageDialogStore();
const { pinningMessageId } = storeToRefs(messageDialogStore);
const { isOpen, item: message } = useSingletonDialog(pinningMessageId, () =>
  items.value.find(({ id }) => id === pinningMessageId.value),
);
const creator = useCreator(message);
</script>

<template>
  <StyledDialog
    v-if="message && creator"
    v-model="isOpen"
    :awaited-because="AwaitedReason.ServerDecidedOutcome"
    :confirm="() => {
      const target = getMessageWriteTarget(message, getSlice);
      if (!target) return;

      return pinMessage({ id: target.messageId, roomId: target.roomId });
    }"
    confirm-label="Oh yeah. Pin it"
    title="Pin It. Pin It Good."
  >
    <!-- The dialog closes once the room answers the pin. A refused pin leaves the message as it was,
    Under the alert -->
    <p>Hey, just double-checking that you want to pin this message to the current room for posterity and greatness?</p>
    <div py-2 ui-frame>
      <component :is="MessageComponentMap[message.type]" :creator :message is-preview />
    </div>
  </StyledDialog>
</template>
