<script setup lang="ts">
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useDataStore } from "@/store/message/data";
import { useMessageDialogStore } from "@/store/message/dialog";

const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const messageDialogStore = useMessageDialogStore();
const { pinningRowKey } = storeToRefs(messageDialogStore);
const message = computed(() => items.value.find(({ rowKey }) => rowKey === pinningRowKey.value));
const creator = useCreator(message);
const isOpen = useSingletonDialog(pinningRowKey);
const { executeMutation } = useMutation();
const pinMessage = async (onComplete: () => void) => {
  if (!message.value) return;
  const target = message.value;
  const { partitionKey, rowKey } = target;
  onComplete();
  await executeMutation(() => $trpc.message.pinMessage.mutate({ partitionKey, rowKey }), {
    applyOptimistic: () => {
      target.isPinned = true;
      return () => {
        delete target.isPinned;
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
