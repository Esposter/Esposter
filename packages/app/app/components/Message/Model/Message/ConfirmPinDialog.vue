<script setup lang="ts">
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useMessageStore } from "@/store/message";
import { useDataStore } from "@/store/message/data";
import { withFinalizerAsync } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const messageStore = useMessageStore();
const { pinningRowKey } = storeToRefs(messageStore);
const message = computed(() => items.value.find(({ rowKey }) => rowKey === pinningRowKey.value));
const creator = useCreator(message);
const isOpen = computed({
  get: () => Boolean(pinningRowKey.value),
  set: (value) => {
    if (value) return;
    pinningRowKey.value = undefined;
  },
});
</script>

<template>
  <StyledDialog
    v-if="message && creator"
    v-model="isOpen"
    :card-props="{
      title: 'Pin It. Pin It Good.',
      text: 'Hey, just double-checking that you want to pin this message to the current room for posterity and greatness?',
    }"
    :confirm-button-props="{ text: 'Oh yeah. Pin it' }"
    @confirm="
      async (onComplete) => {
        if (!message) return;
        const { partitionKey, rowKey } = message;
        await withFinalizerAsync(() => $trpc.message.pinMessage.mutate({ partitionKey, rowKey }), onComplete);
      }
    "
  >
    <div mx-4 py-2 b-1 b-text rd-lg b-solid shadow-md>
      <component :is="MessageComponentMap[message.type]" :creator :message is-preview />
    </div>
  </StyledDialog>
</template>
