<script setup lang="ts">
import type { MessageEntity } from "@/models/azure/message";
import { useMemberStore } from "@/store/useMemberStore";

interface MessageListItemContainerProps {
  currentMessage: MessageEntity;
  nextMessage?: MessageEntity;
}

const props = defineProps<MessageListItemContainerProps>();
const { currentMessage, nextMessage } = $(toRefs(props));
const memberStore = useMemberStore();
const { memberList } = $(storeToRefs(memberStore));
// @NOTE: We'll need to search for the creators in the user database in the future
// if we want to show messages from members who have left the room
const creator = $computed(() => memberList.find((m) => m.id === currentMessage.creatorId));
</script>

<template>
  <template v-if="creator">
    <ChatModelMessageListItem :message="currentMessage" :creator="creator" />
    <ChatTimelineMessage :current-message-date="currentMessage.createdAt" :next-message-date="nextMessage?.createdAt" />
  </template>
</template>
