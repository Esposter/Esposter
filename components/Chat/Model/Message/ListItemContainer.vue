<script setup lang="ts">
import type { MessageEntity } from "@/models/azure/message";
import { useMemberStore } from "@/store/chat/member";

interface MessageListItemContainerProps {
  currentMessage: MessageEntity;
  nextMessage?: MessageEntity;
}

const props = defineProps<MessageListItemContainerProps>();
const { currentMessage, nextMessage } = toRefs(props);
const memberStore = useMemberStore();
const { memberList } = storeToRefs(memberStore);
// We won't show messages from members that have left the room for simplicity
const creator = computed(() => memberList.value.find((m) => m.id === currentMessage.value.creatorId));
</script>

<template>
  <template v-if="creator">
    <ChatModelMessageListItem :message="currentMessage" :creator="creator" />
    <ChatModelMessageTimeline
      :current-message-date="currentMessage.createdAt"
      :next-message-date="nextMessage?.createdAt"
    />
  </template>
</template>
