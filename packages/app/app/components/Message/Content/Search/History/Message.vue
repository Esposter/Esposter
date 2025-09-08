<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useMessageStore } from "@/store/message";

interface MessageProps {
  message: MessageEntity;
}

const { message } = defineProps<MessageProps>();
const scrollToMessage = useScrollToMessage();
const messageStore = useMessageStore();
const { userMap } = storeToRefs(messageStore);
const creator = computed(() => userMap.value.get(message.userId));
</script>

<template>
  <v-list-item v-if="creator" cursor-pointer @click="scrollToMessage(message.rowKey)">
    <MessageModelMessage :creator :message is-preview />
  </v-list-item>
</template>
