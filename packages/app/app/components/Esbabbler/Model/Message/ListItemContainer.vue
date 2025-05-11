<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useMemberStore } from "@/store/esbabbler/member";

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
    <EsbabblerModelMessageListItem :creator :message="currentMessage" :next-message />
    <EsbabblerModelMessageTimeline
      :current-message-date="currentMessage.createdAt"
      :next-message-date="nextMessage?.createdAt"
    />
  </template>
</template>
