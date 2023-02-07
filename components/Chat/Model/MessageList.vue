<script setup lang="ts">
import VWaypoint from "@/components/VWaypoint.vue";
import type { MessageEntity } from "@/models/azure/message";

interface MessageListProps {
  messages: MessageEntity[];
  hasMore: boolean;
  fetchMoreMessages: InstanceType<typeof VWaypoint>["$props"]["onChange"];
}

const props = defineProps<MessageListProps>();
const { messages, hasMore, fetchMoreMessages } = $(toRefs(props));
</script>

<template>
  <v-list display="flex" flex="1 col-reverse" basis="full" overflow-y="auto!" lines="two">
    <template v-for="(message, index) in messages" :key="message.rowKey">
      <ChatModelMessageListItem :message="message" />
      <ChatTimelineMessage
        :current-message-date="message.createdAt"
        :next-message-date="messages[index + 1]?.createdAt"
      />
    </template>
    <VWaypoint :active="hasMore" @change="fetchMoreMessages" />
  </v-list>
</template>
