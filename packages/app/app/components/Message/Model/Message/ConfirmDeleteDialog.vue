<script setup lang="ts">
import { MessageComponentMap } from "@/services/message/MessageComponentMap";
import { useMessageStore } from "@/store/message";
import { useDataStore } from "@/store/message/data";
import { withFinalizerAsync } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const dataStore = useDataStore();
const { items } = storeToRefs(dataStore);
const messageStore = useMessageStore();
const { deletingRowKey } = storeToRefs(messageStore);
const message = computed(() => items.value.find(({ rowKey }) => rowKey === deletingRowKey.value));
const creator = useCreator(message);
const isOpen = computed({
  get: () => Boolean(deletingRowKey.value),
  set: (value) => {
    if (value) return;
    deletingRowKey.value = undefined;
  },
});
</script>

<template>
  <StyledDeleteFormDialog
    v-if="message && creator"
    v-model="isOpen"
    :card-props="{
      title: 'Delete Message',
      text: 'Are you sure you want to delete this message?',
    }"
    @delete="
      async (onComplete) => {
        if (!message) return;
        const { partitionKey, rowKey } = message;
        await withFinalizerAsync(() => $trpc.message.deleteMessage.mutate({ partitionKey, rowKey }), onComplete);
      }
    "
  >
    <div mx-4 py-2 b-1 b-text rd-lg b-solid shadow-md>
      <component :is="MessageComponentMap[message.type]" :creator :message is-preview />
    </div>
  </StyledDeleteFormDialog>
</template>
