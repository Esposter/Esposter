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
    <ChatModelMessageListItem v-for="message in messages" :key="message.rowKey" :message="message" />
    <VWaypoint :active="hasMore" @change="fetchMoreMessages" />
  </v-list>
</template>
