<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { useMemberStore } from "@/store/message/member";
import { MessageType } from "@esposter/db-schema";

interface MessageListItemContainerProps {
  message: MessageEntity;
  nextMessage?: MessageEntity;
}

const { message, nextMessage } = defineProps<MessageListItemContainerProps>();
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const creator = computed(() =>
  message.type === MessageType.Webhook ? message.appUser : members.value.find(({ id }) => id === message.userId),
);
</script>

<template>
  <template v-if="creator">
    <MessageModelMessageListItem :creator :message :next-message />
    <MessageModelMessageTimeline :message-date="message.createdAt" :next-message-date="nextMessage?.createdAt" />
  </template>
</template>
