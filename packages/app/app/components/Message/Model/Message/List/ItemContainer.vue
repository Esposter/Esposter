<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { useMemberStore } from "@/store/message/member";

interface MessageListItemContainerProps {
  currentMessage: MessageEntity;
  nextMessage?: MessageEntity;
}

const { currentMessage, nextMessage } = defineProps<MessageListItemContainerProps>();
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const creator = computed(() => members.value.find(({ id }) => id === currentMessage.userId));
</script>

<template>
  <template v-if="creator">
    <MessageModelMessageListItem :creator :message="currentMessage" :next-message />
    <MessageModelMessageTimeline
      :current-message-date="currentMessage.createdAt"
      :next-message-date="nextMessage?.createdAt"
    />
  </template>
</template>
