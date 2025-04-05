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
  <!-- We won't show messages from members that have left the room for simplicity -->
  <template v-if="creator">
    <EsbabblerModelMessageListItem :message="currentMessage" :creator />
    <EsbabblerModelMessageTimeline
      :current-message-date="currentMessage.createdAt"
      :next-message-date="nextMessage?.createdAt"
    />
  </template>
</template>
