<script setup lang="ts">
import Waypoint from "@/components/Waypoint.vue";
import type { MessageEntity } from "@/services/azure/types";

interface MessageListProps {
  messages: MessageEntity[];
  hasMore: boolean;
  fetchMoreMessages: InstanceType<typeof Waypoint>["$props"]["onChange"];
}

const props = defineProps<MessageListProps>();
const { fetchMoreMessages } = props;
const { messages, hasMore } = toRefs(props);
</script>

<template>
  <v-list display="flex" flex="1 col-reverse" basis="full" overflow-y="auto!" lines="two">
    <ChatModelMessageListItem v-for="message in messages" :key="message.rowKey" :message="message" />
    <Waypoint :active="hasMore" @change="fetchMoreMessages" />
  </v-list>
</template>
