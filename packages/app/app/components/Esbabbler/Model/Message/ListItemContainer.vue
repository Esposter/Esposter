<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { useMemberStore } from "@/store/esbabbler/member";

interface MessageListItemContainerProps {
  currentMessage: MessageEntity;
  nextMessage?: MessageEntity;
}

const { currentMessage, nextMessage } = defineProps<MessageListItemContainerProps>();
const memberStore = useMemberStore();
const { memberList } = storeToRefs(memberStore);
// We won't show messages from members that have left the room for simplicity
const creator = computed(() => memberList.value.find((m) => m.id === currentMessage.userId));
</script>

<template>
  <template v-if="creator">
    <EsbabblerModelMessageListItem :message="currentMessage" :creator />
    <EsbabblerModelMessageTimeline
      :current-message-date="currentMessage.createdAt"
      :next-message-date="nextMessage?.createdAt"
    />
  </template>
</template>
